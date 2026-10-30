
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
        TO_CHAR(
          t.created_at AT TIME ZONE 'UTC'
          AT TIME ZONE 'Asia/Kolkata',
          'YYYY-MM-DD HH24:MI:SS'
        ) AS created_at,
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
