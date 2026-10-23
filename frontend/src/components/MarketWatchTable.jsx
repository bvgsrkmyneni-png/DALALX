function MarketWatchTable({
  filteredStocks,
  formatMoney,
  getCurrentPrice,
  openOrderModal
}) {
  return (
    <section className="panel">
      <div className="market-table-header">
        <span>STOCK</span>
        <span>LTP</span>
        <span>CHANGE</span>
        <span>DAY OPEN</span>
        <span>ACTION</span>
      </div>

      {filteredStocks.map((stock) => {
        const change = Number(
          stock.change_percent || 0
        );

        return (
          <div
            className="market-table-row"
            key={stock.stock_id}
          >
            <div className="market-company">
              <div className="stock-avatar">
                {stock.symbol.substring(0, 2)}
              </div>

              <div>
                <strong>
                  {stock.symbol}
                </strong>

                <span>
                  {stock.company_name}
                </span>
              </div>
            </div>

            <strong className="ltp">
              ₹
              {formatMoney(
                getCurrentPrice(stock)
              )}
            </strong>

            <span
              className={
                change >= 0
                  ? "green"
                  : "red"
              }
            >
              {change >= 0 ? "+" : ""}
              {change.toFixed(2)}%
            </span>

            <span className="day-open">
              ₹
              {formatMoney(
                stock.day_open_price ||
                  stock.current_price
              )}
            </span>

            <div className="row-actions">
              <button
                className="quick-buy"
                onClick={() =>
                  openOrderModal(
                    stock,
                    "BUY"
                  )
                }
              >
                Buy
              </button>

              <button
                className="quick-sell"
                onClick={() =>
                  openOrderModal(
                    stock,
                    "SELL"
                  )
                }
              >
                Sell
              </button>
            </div>
          </div>
        );
      })}
    </section>
  );
}

export default MarketWatchTable;