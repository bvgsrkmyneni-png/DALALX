function FundsCard({
  balance,
  portfolioValue,
  totalAccountValue,
  formatMoney
}) {
  return (
    <div className="funds-layout">
      <div className="fund-card-main">
        <span>
          Available funds
        </span>

        <strong>
          ₹{formatMoney(balance)}
        </strong>

        <p>
          This amount can be used to buy
          stocks in the virtual market.
        </p>
      </div>

      <div className="fund-detail-card">
        <span>
          Current investments
        </span>

        <strong>
          ₹{formatMoney(portfolioValue)}
        </strong>
      </div>

      <div className="fund-detail-card">
        <span>
          Total account value
        </span>

        <strong>
          ₹{formatMoney(totalAccountValue)}
        </strong>
      </div>
    </div>
  );
}

export default FundsCard;