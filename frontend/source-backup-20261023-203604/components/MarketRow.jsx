function MarketRow({
  stock,
  openOrderModal,
  formatMoney,
  getCurrentPrice
}) {
  const change = Number(stock.change_percent || 0);

  return (
    <div className="market-row">
      <div className="market-company">
        <div className="stock-avatar">
          {stock.symbol.substring(0, 2)}
        </div>

        <div>
          <strong>{stock.symbol}</strong>
          <span>{stock.company_name}</span>
        </div>
      </div>

      <div className="market-price">
        ₹{formatMoney(getCurrentPrice(stock))}
      </div>

      <div
        className={
          change >= 0
            ? "green market-change"
            : "red market-change"
        }
      >
        {change >= 0 ? "+" : ""}
        {change.toFixed(2)}%
      </div>

      <div className="market-actions">
        <button
          className="quick-buy"
          onClick={() => openOrderModal(stock, "BUY")}
        >
          Buy
        </button>

        <button
          className="quick-sell"
          onClick={() => openOrderModal(stock, "SELL")}
        >
          Sell
        </button>
      </div>
    </div>
  );
}

export default MarketRow;