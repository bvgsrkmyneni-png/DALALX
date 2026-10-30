const crypto = require("crypto");
const pool = require("../config/db");
const razorpay = require("../config/razorpay");

// Create a Razorpay order for wallet top-up
const createWalletOrder = async (req, res) => {
  try {
    const userId = req.user.userId;
    const amount = Number(req.body.amount);

    if (!Number.isFinite(amount) || amount < 1 || amount > 100000) {
      return res.status(400).json({
        message: "Enter an amount between ₹1 and ₹1,00,000."
      });
    }

    // Convert rupees to paise without floating-point rounding errors
    const amountInPaise = Math.round(amount * 100);

    if (Math.abs(amount * 100 - amountInPaise) > 0.000001) {
      return res.status(400).json({
        message: "Amount can have a maximum of two decimal places."
      });
    }

    const userResult = await pool.query(
      "SELECT user_id, name, email FROM users WHERE user_id = $1",
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    const user = userResult.rows[0];

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: `wallet_${userId}_${Date.now()}`,
      notes: {
        user_id: String(userId),
        purpose: "DALALX virtual wallet top-up"
      }
    });

    await pool.query(
      `INSERT INTO wallet_payments
       (user_id, razorpay_order_id, amount, status)
       VALUES ($1, $2, $3, 'CREATED')`,
      [userId, order.id, amount.toFixed(2)]
    );

    return res.status(201).json({
      message: "Razorpay order created.",
      key: process.env.RAZORPAY_KEY_ID,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      name: user.name,
      email: user.email
    });
  } catch (error) {
    console.error("Create wallet order error:", error);

    return res.status(500).json({
      message: "Unable to create payment order."
    });
  }
};


// Verify payment and credit wallet exactly once
const verifyWalletPayment = async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature
  } = req.body;

  const userId = req.user.userId;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({
      message: "Payment verification details are missing."
    });
  }

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  const signatureBuffer = Buffer.from(razorpay_signature, "hex");
  const expectedBuffer = Buffer.from(expectedSignature, "hex");

  if (
    signatureBuffer.length !== expectedBuffer.length ||
    !crypto.timingSafeEqual(signatureBuffer, expectedBuffer)
  ) {
    return res.status(400).json({
      message: "Payment signature verification failed."
    });
  }

  const client = await pool.connect();
  let transactionStarted = false;

  try {
    await client.query("BEGIN");
    transactionStarted = true;

    // Lock the order row to prevent duplicate wallet credits
    const paymentResult = await client.query(
      `SELECT *
       FROM wallet_payments
       WHERE razorpay_order_id = $1
         AND user_id = $2
       FOR UPDATE`,
      [razorpay_order_id, userId]
    );

    if (paymentResult.rows.length === 0) {
      await client.query("ROLLBACK");
      transactionStarted = false;

      return res.status(404).json({
        message: "Wallet payment order not found."
      });
    }

    const payment = paymentResult.rows[0];

    if (payment.status === "PAID") {
      await client.query("ROLLBACK");
      transactionStarted = false;

      return res.status(200).json({
        message: "This payment has already been credited.",
        alreadyProcessed: true
      });
    }

    if (payment.status !== "CREATED") {
      await client.query("ROLLBACK");
      transactionStarted = false;

      return res.status(400).json({
        message: "This payment order cannot be processed."
      });
    }

    // Ask Razorpay for the actual payment details
    const razorpayPayment = await razorpay.payments.fetch(
      razorpay_payment_id
    );

    if (
      razorpayPayment.order_id !== razorpay_order_id ||
      razorpayPayment.status !== "captured" ||
      Number(razorpayPayment.amount) !==
        Math.round(Number(payment.amount) * 100) ||
      razorpayPayment.currency !== "INR"
    ) {
      await client.query("ROLLBACK");
      transactionStarted = false;

      return res.status(400).json({
        message: "Payment is not captured or payment details do not match."
      });
    }

    // Credit the wallet only after successful verification
    await client.query(
      `UPDATE users
       SET balance = COALESCE(balance, 0) + $1
       WHERE user_id = $2`,
      [payment.amount, userId]
    );

    await client.query(
      `UPDATE wallet_payments
       SET status = 'PAID',
           razorpay_payment_id = $1,
           paid_at = CURRENT_TIMESTAMP
       WHERE payment_id = $2`,
      [razorpay_payment_id, payment.payment_id]
    );

    const balanceResult = await client.query(
      "SELECT balance FROM users WHERE user_id = $1",
      [userId]
    );

    await client.query("COMMIT");
    transactionStarted = false;

    return res.status(200).json({
      message: "Payment successful! Wallet credited.",
      amountCredited: payment.amount,
      balance: balanceResult.rows[0].balance
    });
  } catch (error) {
    if (transactionStarted) {
      await client.query("ROLLBACK");
    }

    console.error("Verify wallet payment error:", error);

    return res.status(500).json({
      message: "Unable to verify and credit this payment."
    });
  } finally {
    client.release();
  }
};


// Get current wallet balance
const getWalletBalance = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT balance FROM users WHERE user_id = $1",
      [req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    return res.json({
      balance: result.rows[0].balance
    });
  } catch (error) {
    console.error("Get wallet balance error:", error);

    return res.status(500).json({
      message: "Unable to fetch wallet balance."
    });
  }
};

module.exports = {
  createWalletOrder,
  verifyWalletPayment,
  getWalletBalance
};
