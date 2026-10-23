function OrderModal({
  show,
  stock,
  orderType,
  setOrderType,
  quantity,
  setQuantity,
  balance,
  loading,
  onClose,
  onPlaceOrder,
  formatMoney,
  getCurrentPrice
}) {
  if (!show || !stock) {
    return null;
  }

  const currentPrice = getCurrentPrice(stock);
  const change = Number(stock.change_percent || 0);

  return (
    <div className="order-overlay">
      <div className="order-window">

        <div className="order-window-header">
          <div>
            <span>
              {orderType === "BUY"
                ? "BUY ORDER"
                : "SELL ORDER"}
            </span>

            <h2>{stock.symbol}</h2>

            <p>{stock.company_name}</p>
          </div>

          <button
            className="modal-close"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <div className="order-live-price">
          <div>
            <span>Last traded price</span>

            <strong>
              ₹{formatMoney(currentPrice)}
            </strong>
          </div>

          <div
            className={
              change >= 0
                ? "green"
                : "red"
            }
          >
            {change >= 0 ? "+" : ""}
            {change.toFixed(2)}%
          </div>
        </div>

        <div className="order-type-tabs">
          <button
            className={
              orderType === "BUY"
                ? "active-buy"
                : ""
            }
            onClick={() =>
              setOrderType("BUY")
            }
          >
            BUY
          </button>

          <button
            className={
              orderType === "SELL"
                ? "active-sell"
                : ""
            }
            onClick={() =>
              setOrderType("SELL")
            }
          >
            SELL
          </button>
        </div>

        <label>Quantity</label>

        <input
          className="order-quantity"
          type="number"
          min="1"
          value={quantity}
          onChange={(e) =>
            setQuantity(
              Number(e.target.value)
            )
          }
        />

        <div className="order-summary">
          <div>
            <span>Estimated value</span>

            <strong>
              ₹
              {formatMoney(
                currentPrice *
                  Number(quantity || 0)
              )}
            </strong>
          </div>

          <div>
            <span>Available funds</span>

            <strong>
              ₹{formatMoney(balance)}
            </strong>
          </div>
        </div>

        <button
          className={
            orderType === "BUY"
              ? "place-buy"
              : "place-sell"
          }
          onClick={onPlaceOrder}
          disabled={loading}
        >
          {loading
            ? "Processing..."
            : `Confirm ${orderType}`}
        </button>

        <p className="order-note">
          This is a virtual order for educational purposes.
        </p>
      </div>
    </div>
  );
}

export default OrderModal;