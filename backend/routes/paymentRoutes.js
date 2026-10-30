const express = require("express");

const authenticateToken = require("../middleware/authMiddleware");

const {
  createWalletOrder,
  verifyWalletPayment,
  getWalletBalance
} = require("../controllers/paymentController");

const router = express.Router();

router.use(authenticateToken);

router.post("/create-order", createWalletOrder);
router.post("/verify", verifyWalletPayment);
router.get("/balance", getWalletBalance);

// <<<<<<< HEA
module.exports = router;
// =======
module.exports = router;

