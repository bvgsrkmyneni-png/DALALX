const pool = require("../config/db");

const getStocks = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        stock_id,
        symbol,
        company_name,
        current_price,
        change_percent,
        day_open_price
      FROM stocks
      ORDER BY stock_id ASC
    `);

    res.status(200).json({
      stocks: result.rows
    });
  } catch (error) {
    console.error("Stock error:", error);

    res.status(500).json({
      message: "Server error"
    });
  }
};

module.exports = {
  getStocks
};