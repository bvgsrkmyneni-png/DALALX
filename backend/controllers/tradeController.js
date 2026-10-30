
const pool = require("../config/db");
const sendEmail = require("../config/email");

// ==================== EMAIL NOTIFICATION ====================

const sendTradeEmail = async ({
  userId,
  stock,
  quantity,
  price,
  totalAmount,
  type
}) => {
  try {
    const result = await pool.query(
      `SELECT name, email
       FROM users
       WHERE user_id = $1`,
      [userId]
    );

    if (result.rows.length === 0) return;

    const user = result.rows[0];

    await sendEmail({
      to: user.email,
      subject: `DALALX ${type} Order Successful`,
      text: `Hi ${user.name}, your ${type} order for ${quantity} shares of ${stock} was successful. Price: ${price}. Total: ${totalAmount}.`,
      html: `
        <div style="font-family:Arial;padding:25px;color:#222">
          <h2 style="color:#2563eb">DALALX ${type} Confirmation</h2>
          <p>Hi ${user.name},</p>
          <p>Your virtual stock ${type.toLowerCase()} order was successful!</p>
          <table style="border-collapse:collapse">
            <tr><td style="padding:8px">Stock</td><td><b>${stock}</b></td></tr>
            <tr><td style="padding:8px">Quantity</td><td><b>${quantity}</b></td></tr>
            <tr><td style="padding:8px">Price per share</td><td><b>₹${price}</b></td></tr>
            <tr><td style="padding:8px">Total amount</td><td><b>₹${totalAmount}</b></td></tr>
          </table>
          <p>Thank you for using DALALX!</p>
          <p><b>Team DALALX</b></p>
          <small>This is a virtual stock trading platform. No real money was used.</small>
        </div>
      `
    });

    console.log(`${type} email sent to:`, user.email);
  } catch (error) {
    console.error(`${type} email failed:`, error.message);
  }
};

// ==================== VALIDATION ====================

const validateTradeInput = (stock_id, quantity) => {
  const stockIdNumber = Number(stock_id);
  const quantityNumber = Number(quantity);

  if (!Number.isInteger(stockIdNumber) || stockIdNumber <= 0) {
    return { valid: false, message: "Invalid stock ID" };
  }

  if (!Number.isInteger(quantityNumber) || quantityNumber <= 0) {
    return {
      valid: false,
      message: "Quantity must be a positive whole number"
    };
  }

  if (!Number.isSafeInteger(quantityNumber)) {
    return { valid: false, message: "Quantity is too large" };
  }

  return {
    valid: true,
    stockId: stockIdNumber,
    quantity: quantityNumber
  };
};

// ==================== BUY STOCK ====================

const buyStock = async (req, res) => {
  const client = await pool.connect();
  let transactionStarted = false;

  try {
    const userId = req.user.userId;
    const { stock_id, quantity } = req.body;

    const validation = validateTradeInput(stock_id, quantity);

    if (!validation.valid) {
      return res.status(400).json({ message: validation.message });
    }

    const stockId = validation.stockId;
    const quantityNumber = validation.quantity;

    await client.query("BEGIN");
    transactionStarted = true;

    const stockResult = await client.query(
      `SELECT * FROM stocks
       WHERE stock_id = $1
       FOR UPDATE`,
      [stockId]
    );

    if (stockResult.rows.length === 0) {
      await client.query("ROLLBACK");
      transactionStarted = false;
      return res.status(404).json({ message: "Stock not found" });
    }

    const stock = stockResult.rows[0];
    const price = Number(stock.current_price);
    const totalAmount = price * quantityNumber;

    const balanceResult = await client.query(
      `UPDATE users
       SET balance = balance - $1
       WHERE user_id = $2
       AND balance >= $1
       RETURNING balance`,
      [totalAmount, userId]
    );

    if (balanceResult.rows.length === 0) {
      await client.query("ROLLBACK");
      transactionStarted = false;

      return res.status(400).json({
        message: "Insufficient balance. You do not have enough virtual money for this purchase."
      });
    }

    const portfolioResult = await client.query(
      `SELECT * FROM portfolio
       WHERE user_id = $1
       AND stock_id = $2
       FOR UPDATE`,
      [userId, stockId]
    );

    if (portfolioResult.rows.length === 0) {
      await client.query(
        `INSERT INTO portfolio
         (user_id, stock_id, quantity, average_price)
         VALUES ($1, $2, $3, $4)`,
        [userId, stockId, quantityNumber, price]
      );
    } else {
      const portfolio = portfolioResult.rows[0];
      const oldQuantity = Number(portfolio.quantity);
      const oldAveragePrice = Number(portfolio.average_price);
      const newQuantity = oldQuantity + quantityNumber;

      const newAveragePrice =
        ((oldQuantity * oldAveragePrice) +
          (quantityNumber * price)) / newQuantity;

      await client.query(
        `UPDATE portfolio
         SET quantity = $1, average_price = $2
         WHERE portfolio_id = $3`,
        [newQuantity, newAveragePrice, portfolio.portfolio_id]
      );
    }

    await client.query(
      `INSERT INTO transactions
       (user_id, stock_id, transaction_type, quantity, price, total_amount)
       VALUES ($1, $2, 'BUY', $3, $4, $5)`,
      [userId, stockId, quantityNumber, price, totalAmount]
    );

    await client.query("COMMIT");
    transactionStarted = false;

    res.status(201).json({
      message: "Stock purchased successfully",
      stock: stock.symbol,
      quantity: quantityNumber,
      price,
      total_amount: totalAmount,
      remaining_balance: Number(balanceResult.rows[0].balance)
    });

    // Email is sent after successful purchase.
    await sendTradeEmail({
      userId,
      stock: stock.symbol,
      quantity: quantityNumber,
      price,
      totalAmount,
      type: "BUY"
    });

  } catch (error) {
    if (transactionStarted) {
      try {
        await client.query("ROLLBACK");
      } catch (rollbackError) {
        console.error("Buy rollback error:", rollbackError.message);
      }
    }

    console.error("Buy stock error:", error);

    if (!res.headersSent) {
      res.status(500).json({
        message: "Unable to complete the purchase. Please try again."
      });
    }
  } finally {
    client.release();
  }
};

// ==================== SELL STOCK ====================

const sellStock = async (req, res) => {
  const client = await pool.connect();
  let transactionStarted = false;

  try {
    const userId = req.user.userId;
    const { stock_id, quantity } = req.body;

    const validation = validateTradeInput(stock_id, quantity);

    if (!validation.valid) {
      return res.status(400).json({ message: validation.message });
    }

    const stockId = validation.stockId;
    const quantityNumber = validation.quantity;

    await client.query("BEGIN");
    transactionStarted = true;

    const stockResult = await client.query(
      `SELECT * FROM stocks
       WHERE stock_id = $1
       FOR UPDATE`,
      [stockId]
    );

    if (stockResult.rows.length === 0) {
      await client.query("ROLLBACK");
      transactionStarted = false;
      return res.status(404).json({ message: "Stock not found" });
    }

    const stock = stockResult.rows[0];
    const price = Number(stock.current_price);
    const totalAmount = price * quantityNumber;

    const portfolioResult = await client.query(
      `SELECT * FROM portfolio
       WHERE user_id = $1
       AND stock_id = $2
       FOR UPDATE`,
      [userId, stockId]
    );

    if (portfolioResult.rows.length === 0) {
      await client.query("ROLLBACK");
      transactionStarted = false;

      return res.status(400).json({
        message: "You do not own this stock."
      });
    }

    const portfolio = portfolioResult.rows[0];
    const ownedQuantity = Number(portfolio.quantity);

    if (ownedQuantity < quantityNumber) {
      await client.query("ROLLBACK");
      transactionStarted = false;

      return res.status(400).json({
        message: `You only own ${ownedQuantity} share(s) of ${stock.symbol}.`
      });
    }

    const remainingQuantity = ownedQuantity - quantityNumber;

    const balanceResult = await client.query(
      `UPDATE users
       SET balance = balance + $1
       WHERE user_id = $2
       RETURNING balance`,
      [totalAmount, userId]
    );

    if (balanceResult.rows.length === 0) {
      await client.query("ROLLBACK");
      transactionStarted = false;

      return res.status(400).json({
        message: "Unable to update account balance."
      });
    }

    if (remainingQuantity === 0) {
      await client.query(
        `DELETE FROM portfolio WHERE portfolio_id = $1`,
        [portfolio.portfolio_id]
      );
    } else {
      await client.query(
        `UPDATE portfolio
         SET quantity = $1
         WHERE portfolio_id = $2`,
        [remainingQuantity, portfolio.portfolio_id]
      );
    }

    await client.query(
      `INSERT INTO transactions
       (user_id, stock_id, transaction_type, quantity, price, total_amount)
       VALUES ($1, $2, 'SELL', $3, $4, $5)`,
      [userId, stockId, quantityNumber, price, totalAmount]
    );

    await client.query("COMMIT");
    transactionStarted = false;

    res.status(200).json({
      message: "Stock sold successfully",
      stock: stock.symbol,
      quantity: quantityNumber,
      price,
      total_amount: totalAmount,
      remaining_balance: Number(balanceResult.rows[0].balance)
    });

    // Email is sent after successful sale.
    await sendTradeEmail({
      userId,
      stock: stock.symbol,
      quantity: quantityNumber,
      price,
      totalAmount,
      type: "SELL"
    });

  } catch (error) {
    if (transactionStarted) {
      try {
        await client.query("ROLLBACK");
      } catch (rollbackError) {
        console.error("Sell rollback error:", rollbackError.message);
      }
    }

    console.error("Sell stock error:", error);

    if (!res.headersSent) {
      res.status(500).json({
        message: "Unable to complete the sale. Please try again."
      });
    }
  } finally {
    client.release();
  }
};

// ==================== GET PORTFOLIO ====================

const getPortfolio = async (req, res) => {
  try {
    const userId = req.user.userId;

    const balanceResult = await pool.query(
      `SELECT balance FROM users WHERE user_id = $1`,
      [userId]
    );

    if (balanceResult.rows.length === 0) {
      return res.status(404).json({
        message: "User account not found"
      });
    }

    const portfolioResult = await pool.query(
      `SELECT
        p.portfolio_id,
        p.stock_id,
        s.symbol,
        s.company_name,
        p.quantity,
        p.average_price,
        s.current_price
       FROM portfolio p
       JOIN stocks s ON p.stock_id = s.stock_id
       WHERE p.user_id = $1
       ORDER BY p.portfolio_id ASC`,
      [userId]
    );

    res.status(200).json({
      balance: Number(balanceResult.rows[0].balance),
      portfolio: portfolioResult.rows
    });

  } catch (error) {
    console.error("Portfolio error:", error);

    res.status(500).json({
      message: "Unable to load portfolio."
    });
  }
};

// ==================== GET TRANSACTIONS ====================

const getTransactions = async (req, res) => {
  try {
    const userId = req.user.userId;

    const result = await pool.query(
      `SELECT
        t.transaction_id,
        t.transaction_type,
        t.quantity,
        t.price,
        t.total_amount,
        t.created_at,
        s.symbol,
        s.company_name
       FROM transactions t
       JOIN stocks s ON t.stock_id = s.stock_id
       WHERE t.user_id = $1
       ORDER BY t.created_at DESC`,
      [userId]
    );

    res.status(200).json({
      transactions: result.rows
    });

  } catch (error) {
    console.error("Transaction history error:", error);

    res.status(500).json({
      message: "Unable to load transaction history."
    });
  }
};

// ==================== EXPORT ====================

module.exports = {
  buyStock,
  sellStock,
  getPortfolio,
  getTransactions
};
