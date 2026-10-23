function DashboardRecentOrders({
  transactions,
  formatMoney,
  setActivePage
}) {
  return (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <h2>Recent Orders</h2>
          <span>Latest transactions</span>
        </div>

        <button
          type="button"
          onClick={() => setActivePage("Transactions")}
        >
          View all {"\u2192"}
        </button>
      </div>

      {transactions.length === 0 ? (
        <div className="empty-box">
          <div className="empty-icon">
            {"\u2301"}
          </div>

          <strong>No transactions</strong>
          <span>Your orders will appear here.</span>
        </div>
      ) : (
        <div className="orders-list">
          {transactions.slice(0, 5).map((transaction) => (
            <div
              className="order-row"
              key={transaction.transaction_id}
            >
              <div
                className={
                  transaction.transaction_type === "BUY"
                    ? "order-badge buy-badge"
                    : "order-badge sell-badge"
                }
              >
                {transaction.transaction_type}
              </div>

              <div className="order-info">
                <strong>{transaction.symbol}</strong>

                <span>
                  {transaction.quantity}
                  {" \u00D7 \u20B9"}
                  {Number(transaction.price).toFixed(2)}
                </span>
              </div>

              <div className="order-total-small">
                {"\u20B9"}
                {formatMoney(transaction.total_amount)}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default DashboardRecentOrders;
