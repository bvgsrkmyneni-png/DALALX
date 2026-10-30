import { useEffect, useMemo, useState } from "react";
import axios from "axios";

const API_URL = "http://localhost:5000/api";

function StockChart({ stock }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/stocks/history/${stock.stock_id}`
      );

      setHistory(response.data.history || []);
    } catch (error) {
      console.error("Chart history error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!stock) {
      return;
    }

    fetchHistory();

    const interval = setInterval(() => {
      fetchHistory();
    }, 3000);

    return () => {
      clearInterval(interval);
    };
  }, [stock]);

  const chartData = useMemo(() => {
    return history.map((item) => ({
      price: Number(item.price),
      time: new Date(item.recorded_at).toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
    }));
  }, [history]);

  if (loading) {
    return (
      <div className="stock-chart-card">
        <div className="chart-header">
          <div>
            <h3>{stock.symbol} Price Chart</h3>
            <span>Loading price history...</span>
          </div>
        </div>

        <div className="chart-loading">
          Loading chart...
        </div>
      </div>
    );
  }

  if (chartData.length < 2) {
    return (
      <div className="stock-chart-card">
        <div className="chart-header">
          <div>
            <h3>{stock.symbol} Price Chart</h3>
            <span>{stock.company_name}</span>
          </div>
        </div>

        <div className="chart-empty">
          <div className="chart-empty-icon">📈</div>

          <p>Collecting price data...</p>

          <small>
            The chart will appear after a few market updates.
          </small>
        </div>
      </div>
    );
  }

  const prices = chartData.map((item) => item.price);

  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  const width = 800;
  const height = 300;
  const padding = 25;

  const priceRange = maxPrice - minPrice || 1;

  const points = chartData
    .map((item, index) => {
      const x =
        padding +
        (index / Math.max(chartData.length - 1, 1)) *
          (width - padding * 2);

      const y =
        height -
        padding -
        ((item.price - minPrice) / priceRange) *
          (height - padding * 2);

      return `${x},${y}`;
    })
    .join(" ");

  const firstPrice = prices[0];
  const lastPrice = prices[prices.length - 1];

  const chartChange = lastPrice - firstPrice;

  const chartChangePercent =
    firstPrice > 0
      ? (chartChange / firstPrice) * 100
      : 0;

  const isPositive = chartChange >= 0;

  return (
    <div className="stock-chart-card">
      <div className="chart-header">
        <div>
          <h3>{stock.symbol} Price Chart</h3>

          <span>{stock.company_name}</span>
        </div>

        <div className="chart-current-price">
          <strong>
            ₹
            {lastPrice.toLocaleString("en-IN", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </strong>

          <small className={isPositive ? "profit" : "loss"}>
            {isPositive ? "+" : ""}
            {chartChangePercent.toFixed(2)}%
          </small>
        </div>
      </div>

      <div className="chart-container">
        <div className="chart-y-axis">
          <span>₹{maxPrice.toFixed(2)}</span>

          <span>
            ₹
            {((maxPrice + minPrice) / 2).toFixed(2)}
          </span>

          <span>₹{minPrice.toFixed(2)}</span>
        </div>

        <svg
          className="stock-chart-svg"
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="none"
        >
          <line
            x1="25"
            y1="25"
            x2="775"
            y2="25"
            className="chart-grid-line"
          />

          <line
            x1="25"
            y1="150"
            x2="775"
            y2="150"
            className="chart-grid-line"
          />

          <line
            x1="25"
            y1="275"
            x2="775"
            y2="275"
            className="chart-grid-line"
          />

          <polyline
            points={points}
            fill="none"
            className={
              isPositive
                ? "chart-line-positive"
                : "chart-line-negative"
            }
          />

          <circle
            cx={
              width -
              padding
            }
            cy={
              height -
              padding -
              ((lastPrice - minPrice) /
                priceRange) *
                (height - padding * 2)
            }
            r="5"
            className={
              isPositive
                ? "chart-point-positive"
                : "chart-point-negative"
            }
          />
        </svg>
      </div>

      <div className="chart-footer">
        <span>
          Start: ₹{firstPrice.toFixed(2)}
        </span>

        <span>
          Current: ₹{lastPrice.toFixed(2)}
        </span>

        <span>
          {chartData.length} data points
        </span>
      </div>
    </div>
  );
}

export default StockChart;