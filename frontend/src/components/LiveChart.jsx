function LiveChart({
  stock,
  large = false,
  priceHistory,
  getCurrentPrice,
  formatMoney
}) {
  const history =
    priceHistory[stock.symbol] || [];

  const prices =
    history.length > 0
      ? history.map(
          (item) => item.price
        )
      : [getCurrentPrice(stock)];

  const width = 800;
  const height = large ? 300 : 230;
  const padding = 30;

  const minPrice =
    Math.min(...prices);

  const maxPrice =
    Math.max(...prices);

  const range =
    maxPrice - minPrice || 1;

  const points = prices.map(
    (price, index) => {
      const x =
        padding +
        (index /
          Math.max(
            prices.length - 1,
            1
          )) *
          (width - padding * 2);

      const y =
        height -
        padding -
        ((price - minPrice) /
          range) *
          (height - padding * 2);

      return `${x},${y}`;
    }
  );

  const currentPrice =
    getCurrentPrice(stock);

  const firstPrice =
    prices[0] || currentPrice;

  const movement =
    currentPrice - firstPrice;

  const positive =
    movement >= 0;

  return (
    <div className="chart-box">
      <div className="chart-top">
        <div>
          <div className="chart-stock-name">
            {stock.symbol}
          </div>

          <div className="chart-stock-company">
            {stock.company_name}
          </div>
        </div>

        <div className="chart-current">
          <strong>
            ₹{formatMoney(currentPrice)}
          </strong>

          <span
            className={
              positive
                ? "green"
                : "red"
            }
          >
            {positive ? "+" : ""}
            ₹{Math.abs(movement).toFixed(2)}
          </span>
        </div>
      </div>

      <div className="chart-area">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="none"
        >
          <line
            x1="30"
            y1={height - 30}
            x2={width - 20}
            y2={height - 30}
            className="chart-grid"
          />

          <line
            x1="30"
            y1="30"
            x2="30"
            y2={height - 30}
            className="chart-grid"
          />

          <polyline
            points={points.join(" ")}
            fill="none"
            className={
              positive
                ? "chart-positive"
                : "chart-negative"
            }
            strokeWidth="3"
          />

          {points.length > 0 && (
            <circle
              cx={
                points[
                  points.length - 1
                ].split(",")[0]
              }
              cy={
                points[
                  points.length - 1
                ].split(",")[1]
              }
              r="5"
              className={
                positive
                  ? "chart-point-green"
                  : "chart-point-red"
              }
            />
          )}
        </svg>
      </div>

      <div className="chart-bottom">
        <span>
          LIVE
        </span>

        <span>
          {history.length} market points
        </span>
      </div>
    </div>
  );
};

export default LiveChart;
