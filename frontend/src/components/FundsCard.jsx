function FundsCard({
  balance,
  portfolioValue,
  totalAccountValue,
  formatMoney,
  amount,
  setAmount,
  handleAddMoney,
  paymentLoading
}) {
  return (
    <div className="funds-page">
      <div className="funds-layout">
        <div className="fund-card-main">
          <span>Available funds</span>
          <strong>₹{formatMoney(balance)}</strong>
          <p>
            This amount can be used to buy stocks in the virtual market.
          </p>
        </div>

        <div className="fund-detail-card">
          <span>Current investments</span>
          <strong>₹{formatMoney(portfolioValue)}</strong>
        </div>

        <div className="fund-detail-card">
          <span>Total account value</span>
          <strong>₹{formatMoney(totalAccountValue)}</strong>
        </div>
      </div>

      <div className="panel wallet-topup-card">
        <div className="panel-heading">
          <div>
            <h2>Add Money</h2>
            <span>Add funds to your DALALX virtual wallet</span>
          </div>
        </div>

        <label htmlFor="wallet-amount">Amount (₹)</label>

        <input
          id="wallet-amount"
          type="number"
          min="1"
          max="100000"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Enter amount"
        />

        <div className="wallet-quick-amounts">
          {[500, 1000, 2000, 5000].map((value) => (
            <button
              type="button"
              key={value}
              onClick={() => setAmount(String(value))}
            >
              ₹{value.toLocaleString("en-IN")}
            </button>
          ))}
        </div>

        <button
          type="button"
          className="wallet-add-button"
          onClick={handleAddMoney}
          disabled={paymentLoading}
        >
          {paymentLoading ? "Processing..." : "Add Money with Razorpay"}
        </button>

        <p className="wallet-payment-note">
          Secure payment through Razorpay Test Mode. This is a virtual trading wallet.
        </p>
      </div>
    </div>
  );
}

export default FundsCard;