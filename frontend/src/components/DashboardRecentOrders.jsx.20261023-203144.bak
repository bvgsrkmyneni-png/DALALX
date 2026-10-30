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
          onClick={() =>
            setActivePage("Transactions")
          }
        >
          View all →
        </button>
      </div>

      {transactions.length === 0 ? (
        <div className="empty-box">
          <div className="empty-icon">
            ⌁
          </div>

          <strong>No transactions</strong>

          <span>
            Your orders will appear here.
          </span>
        </div>
      ) : (
        <div className="orders-list">
          {transactions
            .slice(0, 5)
            .map((transaction) => (
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
                  <strong>
                    {transaction.symbol}
                  </strong>

                  <span>
                    {transaction.quantity} × ₹
                    {Number(
                      transaction.price
                    ).toFixed(2)}
                  </span>
                </div>

                <div className="order-total-small">
                  ₹
                  {formatMoney(
                    transaction.total_amount
                  )}
                </div>
              </div>
            ))}
        </div>
      )}
    </section>
  );
}

export default DashboardRecentOrders;