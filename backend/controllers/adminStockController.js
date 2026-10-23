
const pool = require("../config/db");

// ADMIN: Add a new company/stock
const addStock = async (req, res) => {
  try {
    const { symbol, company_name, current_price } = req.body;

    if (
      typeof symbol !== "string" ||
      typeof company_name !== "string" ||
      typeof current_price !== "number" ||
      !Number.isFinite(current_price) ||
      current_price <= 0
    ) {
      return res.status(400).json({
        message: "Valid symbol, company name and positive price are required"
      });
    }

    const cleanSymbol = symbol.trim().toUpperCase();
    const cleanName = company_name.trim();

    if (
      !/^[A-Z0-9.-]{1,20}$/.test(cleanSymbol) ||
      cleanName.length < 2 ||
      cleanName.length > 150
    ) {
      return res.status(400).json({
        message: "Invalid stock symbol or company name"
      });
    }

    const existing = await pool.query(
      "SELECT stock_id FROM stocks WHERE UPPER(symbol) = $1",
      [cleanSymbol]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({
        message: "Stock symbol already exists"
      });
    }

    const result = await pool.query(
      `INSERT INTO stocks
       (symbol, company_name, current_price, change_percent, day_open_price)
       VALUES ($1, $2, $3, 0, $3)
       RETURNING *`,
      [cleanSymbol, cleanName, current_price]
    );

    return res.status(201).json({
      message: "Company added successfully",
      stock: result.rows[0]
    });

  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({
        message: "Stock already exists"
      });
    }

    console.error("Add stock error:", error);

    return res.status(500).json({
      message: "Server error"
    });
  }
};

const updateStock = async (req, res) => {
  try {
    const stockId = Number(req.params.id);
    const { company_name, current_price } = req.body;

    if (!Number.isSafeInteger(stockId) || stockId <= 0) {
      return res.status(400).json({
        message: "Invalid stock ID"
      });
    }

    if (
      typeof company_name !== "string" ||
      company_name.trim().length < 2 ||
      company_name.trim().length > 150 ||
      typeof current_price !== "number" ||
      !Number.isFinite(current_price) ||
      current_price <= 0
    ) {
      return res.status(400).json({
        message: "Valid company name and positive price are required"
      });
    }

    const result = await pool.query(
      `UPDATE stocks
       SET company_name = $1,
           current_price = $2
       WHERE stock_id = $3
       RETURNING *`,
      [company_name.trim(), current_price, stockId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Company not found"
      });
    }

    return res.status(200).json({
      message: "Company updated successfully",
      stock: result.rows[0]
    });

  } catch (error) {
    console.error("Update company error:", error);

    return res.status(500).json({
      message: "Server error"
    });
  }
};
module.exports = { addStock, updateStock };

