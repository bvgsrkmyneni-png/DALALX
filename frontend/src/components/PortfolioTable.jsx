function PortfolioTable({
  portfolioWithPrices,
  formatMoney
}) {
  return (
    <div className="holdings-table">
      <div className="holdings-header">
        <span>STOCK</span>
        <span>QTY</span>
        <span>AVG. PRICE</span>
        <span>LTP</span>
        <span>INVESTED</span>
        <span>CURRENT VALUE</span>
        <span>P&L</span>
      </div>

      {portfolioWithPrices.map((item) => (
        <div
          className="holdings-row"
          key={item.stock_id}
        >
          <div>
            <strong>{item.symbol}</strong>
            <span>{item.company_name}</span>
          </div>

          <span>{item.quantity}</span>

          <span>
            ₹{Number(item.average_price).toFixed(2)}
          </span>

          <strong>
            ₹{item.currentPrice.toFixed(2)}
          </strong>

          <span>
            ₹{formatMoney(item.invested)}
          </span>

          <span>
            ₹{formatMoney(item.currentValue)}
          </span>

          <div
            className={
              item.pnl >= 0 ? "green" : "red"
            }
          >
            <strong>
              {item.pnl >= 0 ? "+" : ""}
              ₹{formatMoney(Math.abs(item.pnl))}
            </strong>

            <span>
              {item.pnlPercent >= 0 ? "+" : ""}
              {item.pnlPercent.toFixed(2)}%
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default PortfolioTable;