function TransactionsTable({
  transactions,
  formatMoney
}) {
  return (
    <div className="transactions-table">
      <div className="transaction-header">
        <span>TYPE</span>
        <span>STOCK</span>
        <span>QTY</span>
        <span>PRICE</span>
        <span>VALUE</span>
        <span>DATE</span>
      </div>

      {transactions.map((transaction) => (
        <div
          className="transaction-row"
          key={transaction.transaction_id}
        >
          <span>
            <b
              className={
                transaction.transaction_type === "BUY"
                  ? "transaction-buy"
                  : "transaction-sell"
              }
            >
              {transaction.transaction_type}
            </b>
          </span>

          <div>
            <strong>
              {transaction.symbol}
            </strong>

            <span>
              {transaction.company_name}
            </span>
          </div>

          <span>
            {transaction.quantity}
          </span>

          <span>
            ₹{Number(transaction.price).toFixed(2)}
          </span>

          <strong>
            ₹{formatMoney(transaction.total_amount)}
          </strong>

          <span className="transaction-date">
            {new Date(
              transaction.created_at
            ).toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
}

export default TransactionsTable;