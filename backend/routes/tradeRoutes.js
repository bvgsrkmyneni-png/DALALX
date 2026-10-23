const express = require("express");

const {
  buyStock,
  sellStock,
  getPortfolio,
  getTransactions
} = require("../controllers/tradeController");

const authenticateToken = require("../middleware/authMiddleware");

const router = express.Router();

router.post(
  "/buy",
  authenticateToken,
  buyStock
);

router.post(
  "/sell",
  authenticateToken,
  sellStock
);

router.get(
  "/portfolio",
  authenticateToken,
  getPortfolio
);

router.get(
  "/transactions",
  authenticateToken,
  getTransactions
);

module.exports = router;