function DashboardHoldings({
  portfolioWithPrices,
  formatMoney,
  setActivePage
}) {
  return (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <h2>Your Holdings</h2>
          <span>Current portfolio</span>
        </div>

        <button
          onClick={() =>
            setActivePage("Holdings")
          }
        >
          View all →
        </button>
      </div>

      {portfolioWithPrices.length === 0 ? (
        <div className="empty-box">
          <div className="empty-icon">
            ◇
          </div>

          <strong>No holdings yet</strong>

          <span>
            Start trading to build your portfolio.
          </span>
        </div>
      ) : (
        <div className="holding-list">
          {portfolioWithPrices
            .slice(0, 4)
            .map((item) => (
              <div
                className="holding-row"
                key={item.stock_id}
              >
                <div>
                  <strong>
                    {item.symbol}
                  </strong>

                  <span>
                    {item.quantity} shares
                  </span>
                </div>

                <div>
                  <strong>
                    ₹{formatMoney(
                      item.currentValue
                    )}
                  </strong>

                  <span
                    className={
                      item.pnl >= 0
                        ? "green"
                        : "red"
                    }
                  >
                    {item.pnl >= 0 ? "+" : ""}
                    ₹{formatMoney(
                      Math.abs(item.pnl)
                    )}
                  </span>
                </div>
              </div>
            ))}
        </div>
      )}
    </section>
  );
}

export default DashboardHoldings;