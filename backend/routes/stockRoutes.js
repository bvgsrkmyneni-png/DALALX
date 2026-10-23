const express = require("express");

const { getStocks } = require("../controllers/stockController");

const {
  addStock,
  updateStock
} = require("../controllers/adminStockController");

const authenticateToken = require("../middleware/authMiddleware");
const requireAdmin = require("../middleware/adminMiddleware");

const router = express.Router();

// Public: View all companies
router.get("/", getStocks);

// Admin: Add company
router.post(
  "/",
  authenticateToken,
  requireAdmin,
  addStock
);

// Admin: Edit company name and price
router.put(
  "/:id",
  authenticateToken,
  requireAdmin,
  updateStock
);

module.exports = router;
