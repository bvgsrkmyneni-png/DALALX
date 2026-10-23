import AdminDashboard from "./components/AdminDashboard";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Sidebar from "./components/Sidebar";
import TopBar from "./components/TopBar";
import LiveChart from "./components/LiveChart";
import MarketRow from "./components/MarketRow";
import AuthScreen from "./components/AuthScreen";
import PortfolioTable from "./components/PortfolioTable";
import TransactionsTable from "./components/TransactionsTable";
import FundsCard from "./components/FundsCard";
import MarketWatchTable from "./components/MarketWatchTable";
import DashboardHoldings from "./components/DashboardHoldings";
import DashboardRecentOrders from "./components/DashboardRecentOrders";
import "./App.css";

const API_URL = "http://localhost:5000/api";

function App() {
  const [token, setToken] = useState(
    localStorage.getItem("token")
  );

  const [isRegister, setIsRegister] = useState(false);

  const [loginForm, setLoginForm] = useState({
    email: "",
    password: ""
  });

  const [registerForm, setRegisterForm] = useState({
    name: "",
    email: "",
    password: ""
  });

  const [stocks, setStocks] = useState([]);
  const [portfolio, setPortfolio] = useState([]);
  const [transactions, setTransactions] = useState([]);

  const [balance, setBalance] = useState(100000);
  const [userName, setUserName] = useState("Trader");

  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!token) {
      setIsAdmin(false);
      return;
    }

    let cancelled = false;

    const loadAdminRole = async () => {
      try {
        const response = await axios.get(
          `${API_URL}/auth/profile`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        if (!cancelled) {
          setIsAdmin(response.data.user?.role === "ADMIN");
        }
      } catch (error) {
        console.error("Role check failed:", error);
        if (!cancelled) setIsAdmin(false);
      }
    };

    loadAdminRole();

    return () => {
      cancelled = true;
    };
  }, [token]);

  // DALALX light / dark theme
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("dalalx-theme") || "light";
  });

  const toggleTheme = () => {
    setTheme((currentTheme) => {
      const newTheme =
        currentTheme === "light"
          ? "dark"
          : "light";

      localStorage.setItem(
        "dalalx-theme",
        newTheme
      );

      return newTheme;
    });
  };

  const [activePage, setActivePage] =
    useState("Dashboard");

  const [search, setSearch] = useState("");

  const [selectedStock, setSelectedStock] =
    useState(null);

  const [orderType, setOrderType] =
    useState("BUY");

  const [quantity, setQuantity] = useState(1);

  const [showOrderModal, setShowOrderModal] =
    useState(false);

  const [priceHistory, setPriceHistory] =
    useState({});

  const [lastMarketUpdate, setLastMarketUpdate] =
    useState(null);

  const [loading, setLoading] = useState(false);

  const authConfig = {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const response = await axios.post(
        `${API_URL}/auth/login`,
        loginForm
      );

      const newToken = response.data.token;

      localStorage.setItem("token", newToken);
      setToken(newToken);

      setLoginForm({
        email: "",
        password: ""
      });
    } catch (error) {
      console.error(error);

      alert(
        error.response?.data?.message ||
          "Server error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      await axios.post(
        `${API_URL}/auth/register`,
        registerForm
      );

      alert(
        "Registration successful. Please login."
      );

      setIsRegister(false);

      setRegisterForm({
        name: "",
        email: "",
        password: ""
      });
    } catch (error) {
      console.error(error);

      alert(
        error.response?.data?.message ||
          "Registration failed"
      );
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
  };

 

  const fetchProfile = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/auth/profile`,
        authConfig
      );

      if (response.data.user?.name) {
        setUserName(response.data.user.name);
      }
    } catch (error) {
      console.error(
        "Profile error:",
        error.response?.data || error.message
      );
    }
  };

  const fetchStocks = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/stocks`
      );

      const newStocks =
        response.data.stocks || [];

      setStocks(newStocks);
      setLastMarketUpdate(new Date());

      setPriceHistory((previous) => {
        const updated = {
          ...previous
        };

        newStocks.forEach((stock) => {
          const price = Number(
            stock.current_price
          );

          if (!updated[stock.symbol]) {
            updated[stock.symbol] = [];
          }

          const history =
            updated[stock.symbol];

          const last =
            history.length > 0
              ? history[history.length - 1]
              : null;

          if (!last || last.price !== price) {
            updated[stock.symbol] = [
              ...history,
              {
                time: Date.now(),
                price
              }
            ].slice(-40);
          }
        });

        return updated;
      });
    } catch (error) {
      console.error(
        "Stock fetch error:",
        error.response?.data || error.message
      );
    }
  };

  const fetchPortfolio = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/trades/portfolio`,
        authConfig
      );

      setBalance(
        Number(response.data.balance || 0)
      );

      setPortfolio(
        response.data.portfolio || []
      );
    } catch (error) {
      console.error(
        "Portfolio error:",
        error.response?.data || error.message
      );
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/trades/transactions`,
        authConfig
      );

      setTransactions(
        response.data.transactions || []
      );
    } catch (error) {
      console.error(
        "Transaction error:",
        error.response?.data || error.message
      );
    }
  };

 

  useEffect(() => {
    if (!token) return;

    fetchProfile();
    fetchStocks();
    fetchPortfolio();
    fetchTransactions();
  }, [token]);

 

  useEffect(() => {
    if (!token) return;

    const interval = setInterval(() => {
      fetchStocks();
      fetchPortfolio();
    }, 3000);

    return () => clearInterval(interval);
  }, [token]);

  

  const getCurrentPrice = (stock) => {
    return Number(stock?.current_price || 0);
  };

  const formatMoney = (value) => {
    return Number(value || 0).toLocaleString(
      "en-IN",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }
    );
  };

  const formatCompactMoney = (value) => {
    const number = Number(value || 0);

    if (number >= 10000000) {
      return `₹${(number / 10000000).toFixed(2)}Cr`;
    }

    if (number >= 100000) {
      return `₹${(number / 100000).toFixed(2)}L`;
    }

    if (number >= 1000) {
      return `₹${(number / 1000).toFixed(1)}K`;
    }

    return `₹${number.toFixed(0)}`;
  };

 

  const filteredStocks = useMemo(() => {
    const value =
      search.trim().toLowerCase();

    if (!value) {
      return stocks;
    }

    return stocks.filter(
      (stock) =>
        stock.symbol
          .toLowerCase()
          .includes(value) ||
        stock.company_name
          .toLowerCase()
          .includes(value)
    );
  }, [stocks, search]);



  const portfolioWithPrices = useMemo(() => {
    return portfolio.map((item) => {
      const stock = stocks.find(
        (s) =>
          Number(s.stock_id) ===
          Number(item.stock_id)
      );

      const currentPrice = stock
        ? getCurrentPrice(stock)
        : Number(item.average_price);

      const quantityValue =
        Number(item.quantity);

      const averagePrice =
        Number(item.average_price);

      const invested =
        quantityValue * averagePrice;

      const currentValue =
        quantityValue * currentPrice;

      const pnl =
        currentValue - invested;

      const pnlPercent =
        invested > 0
          ? (pnl / invested) * 100
          : 0;

      return {
        ...item,
        symbol:
          item.symbol ||
          stock?.symbol ||
          "-",
        company_name:
          item.company_name ||
          stock?.company_name ||
          "-",
        currentPrice,
        invested,
        currentValue,
        pnl,
        pnlPercent
      };
    });
  }, [portfolio, stocks]);

  const portfolioValue =
    portfolioWithPrices.reduce(
      (total, item) =>
        total + item.currentValue,
      0
    );

  const totalInvested =
    portfolioWithPrices.reduce(
      (total, item) =>
        total + item.invested,
      0
    );

  const totalPnl =
    portfolioValue - totalInvested;

    // P&L based on actual purchase price, not market opening price
  const todayPnl = portfolioWithPrices.reduce(
    (total, item) => total + item.pnl,
    0
  );


  const totalAccountValue =
    balance + portfolioValue;

  

  const openOrderModal = (
    stock,
    type
  ) => {
    setSelectedStock(stock);
    setOrderType(type);
    setQuantity(1);
    setShowOrderModal(true);
  };

  const placeOrder = async () => {
    if (!selectedStock) return;

    if (quantity <= 0) {
      alert(
        "Quantity must be greater than 0."
      );
      return;
    }

    try {
      setLoading(true);

      const endpoint =
        orderType === "BUY"
          ? "/trades/buy"
          : "/trades/sell";

      await axios.post(
        `${API_URL}${endpoint}`,
        {
          stock_id:
            selectedStock.stock_id,
          quantity: Number(quantity)
        },
        authConfig
      );

      alert(
        `${orderType} order completed successfully.`
      );

      setShowOrderModal(false);

      await fetchStocks();
      await fetchPortfolio();
      await fetchTransactions();
    } catch (error) {
      console.error(error);

      alert(
        error.response?.data?.message ||
          "Order failed"
      );
    } finally {
      setLoading(false);
    }
  };

  

  const LiveChart = ({
    stock,
    large = false
  }) => {
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

  /*
  ==================================================
  MARKET ROW
  ==================================================
  */

  const MarketRow = ({
    stock
  }) => {
    const change =
      Number(stock.change_percent || 0);

    return (
      <div className="market-row">

        <div className="market-company">
          <div className="stock-avatar">
            {stock.symbol.substring(
              0,
              2
            )}
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

        <div className="market-price">
          ₹
          {formatMoney(
            getCurrentPrice(stock)
          )}
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
  };

 

  const renderDashboard = () => (
    <>
      <div className="dashboard-heading">
        <div>
          <div className="small-heading">
            DASHBOARD
          </div>

          <h1>
            Welcome back, {userName}
          </h1>

          <p>
            Track your portfolio and market
            movements.
          </p>
        </div>

        <div className="market-status">
          <span className="pulse-dot"></span>

          Market Live

          {lastMarketUpdate && (
            <small>
              {lastMarketUpdate.toLocaleTimeString()}
            </small>
          )}
        </div>
      </div>

      <div className="hero-card">
        <div className="hero-left">
          <span>
            Total account value
          </span>

          <strong>
            ₹
            {formatMoney(
              totalAccountValue
            )}
          </strong>

          <div className="hero-stats">
            <div>
              <span>
                Available funds
              </span>

              <b>
                ₹
                {formatMoney(balance)}
              </b>
            </div>

            <div>
              <span>
                Investments
              </span>

              <b>
                ₹
                {formatMoney(
                  portfolioValue
                )}
              </b>
            </div>
          </div>
        </div>

        <div className="hero-right">
          <div className="hero-mini-chart">
            <svg
              viewBox="0 0 400 130"
              preserveAspectRatio="none"
            >
              <polyline
                points="0,105 40,96 80,100 120,73 160,82 200,54 240,63 280,37 320,47 360,23 400,31"
                fill="none"
                className="hero-line"
                strokeWidth="3"
              />
            </svg>
          </div>
        </div>
      </div>

      <div className="stats-grid">

        <div className="stat-card">
          <div className="stat-icon blue-bg">
            ₹
          </div>

          <div>
            <span>
              Available Funds
            </span>

            <strong>
              ₹{formatCompactMoney(balance).replace("₹", "")}
            </strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon purple-bg">
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
  </svg>
</div>

          <div>
            <span>
              Holdings
            </span>

            <strong>
              {portfolioWithPrices.length}
            </strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon green-bg">
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M3 17l6-6 4 4 8-8" />
    <path d="M15 7h6v6" />
  </svg>
</div>

          <div>
            <span>
              Today's P&L
            </span>

            <strong className={todayPnl >= 0 ? "green" : "red"}>
              {todayPnl >= 0 ? "+" : "-"}
              {"\u20B9"}
              {formatMoney(Math.abs(todayPnl))}
            </strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon orange-bg">
            #
          </div>

          <div>
            <span>
              Transactions
            </span>

            <strong>
              {transactions.length}
            </strong>
          </div>
        </div>

      </div>

      <div className="dashboard-grid">

        <section className="panel market-panel">

          <div className="panel-heading">
            <div>
              <h2>
                Market Watch
              </h2>

              <span>
                Live market prices
              </span>
            </div>

            <button
              onClick={() =>
                setActivePage(
                  "Market Watch"
                )
              }
            >
              View all →
            </button>
          </div>

          <div className="market-header-row">
            <span>
              STOCK
            </span>

            <span>
              PRICE
            </span>

            <span>
              CHANGE
            </span>

            <span>
              ACTION
            </span>
          </div>

          {stocks.map((stock) => (
  <MarketRow
    key={stock.stock_id}
    stock={stock}
    openOrderModal={openOrderModal}
    formatMoney={formatMoney}
    getCurrentPrice={getCurrentPrice}
  />
))}

        </section>

        <section className="panel chart-panel">

          <div className="panel-heading">
            <div>
              <h2>
                Live Chart
              </h2>

              <span>
                Real-time price movement
              </span>
            </div>
          </div>

          {stocks.length > 0 && (
            <LiveChart
              stock={stocks[0]}
              large
            />
          )}

        </section>

      </div>

      <div className="dashboard-grid bottom-grid">

        <DashboardHoldings
  portfolioWithPrices={portfolioWithPrices}
  formatMoney={formatMoney}
  setActivePage={setActivePage}
/>

        <DashboardRecentOrders
  transactions={transactions}
  formatMoney={formatMoney}
  setActivePage={setActivePage}
/>

      </div>
    </>
  );


  const renderMarketWatch = () => (
    <>
      <div className="page-title">
        <div>
          <div className="small-heading">
            MARKETS
          </div>

          <h1>
            Market Watch
          </h1>

          <p>
            Monitor live prices and trade
            instantly.
          </p>
        </div>
      </div>

      <div className="search-box">
        <span>
          âŒ•
        </span>

        <input
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          placeholder="Search by stock name or symbol..."
        />
      </div>

      <MarketWatchTable
  filteredStocks={filteredStocks}
  formatMoney={formatMoney}
  getCurrentPrice={getCurrentPrice}
  openOrderModal={openOrderModal}
/>

      <div className="charts-grid">
        {filteredStocks.map(
          (stock) => (
            <section
              className="panel"
              key={
                `chart-${stock.stock_id}`
              }
            >
              <LiveChart
                stock={stock}
              />
            </section>
          )
        )}
      </div>
    </>
  );

 

  const renderHoldings = () => (
    <>
      <div className="page-title">
        <div>
          <div className="small-heading">
            PORTFOLIO
          </div>

          <h1>
            Holdings
          </h1>

          <p>
            Track your investments and P&L.
          </p>
        </div>
      </div>

      <div className="portfolio-summary">

        <div>
          <span>
            Current value
          </span>

          <strong>
            ₹
            {formatMoney(
              portfolioValue
            )}
          </strong>
        </div>

        <div>
          <span>
            Invested value
          </span>

          <strong>
            ₹
            {formatMoney(
              totalInvested
            )}
          </strong>
        </div>

        <div>
          <span>
            Total P&L
          </span>

          <strong
            className={
              totalPnl >= 0
                ? "green"
                : "red"
            }
          >              {totalPnl >= 0 ? "+" : "-"}
              {"\u20B9"}
              {formatMoney(Math.abs(totalPnl))}
          </strong>
        </div>

      </div>

      <section className="panel">

        {portfolioWithPrices.length ===
        0 ? (
          <div className="empty-box large-empty">
            <div className="empty-icon">
              â—‡
            </div>

            <strong>
              Your portfolio is empty
            </strong>

            <span>
              Buy stocks from Market Watch
              to start investing.
            </span>
          </div>
        ) : (
            
          <PortfolioTable
            portfolioWithPrices={portfolioWithPrices}
            formatMoney={formatMoney}
          />
        )}

      </section>
    </>
  );

  /*
  ==================================================
  ORDERS
  ==================================================
  */

  const renderOrders = () => (
    <>
      <div className="page-title">
        <div>
          <div className="small-heading">
            TRADING
          </div>

          <h1>
            Place Order
          </h1>

          <p>
            Buy and sell virtual stocks.
          </p>
        </div>
      </div>

      <div className="order-stock-grid">
        {stocks.map((stock) => (
          <div
            className="trade-card"
            key={stock.stock_id}
          >
            <div className="trade-card-top">

              <div className="stock-avatar large-avatar">
                {stock.symbol.substring(
                  0,
                  2
                )}
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

            <div className="trade-price">
              ₹
              {formatMoney(
                getCurrentPrice(
                  stock
                )
              )}

              <span
                className={
                  Number(
                    stock.change_percent
                  ) >= 0
                    ? "green"
                    : "red"
                }
              >
                {Number(
                  stock.change_percent
                ) >= 0
                  ? "+"
                  : ""}
                {Number(
                  stock.change_percent
                ).toFixed(2)}
                %
              </span>
            </div>

            <div className="trade-buttons">
              <button
                onClick={() =>
                  openOrderModal(
                    stock,
                    "BUY"
                  )
                }
              >
                BUY
              </button>

              <button
                onClick={() =>
                  openOrderModal(
                    stock,
                    "SELL"
                  )
                }
              >
                SELL
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );

  /*
  ==================================================
  TRANSACTIONS
  ==================================================
  */

  const renderTransactions = () => (
    <>
      <div className="page-title">
        <div>
          <div className="small-heading">
            ACTIVITY
          </div>

          <h1>
            Transactions
          </h1>

          <p>
            Complete trading history.
          </p>
        </div>
      </div>

      <section className="panel">

        {transactions.length === 0 ? (
          <div className="empty-box large-empty">
            <strong>
              No transactions yet
            </strong>

            <span>
              Your completed orders will
              appear here.
            </span>
          </div>
        ) : (
          <TransactionsTable
  transactions={transactions}
  formatMoney={formatMoney}
/>
        )}

      </section>
    </>
  );

  /*
  ==================================================
  FUNDS
  ==================================================
  */

  const renderFunds = () => (
    <>
      <div className="page-title">
        <div>
          <div className="small-heading">
            ACCOUNT
          </div>

          <h1>
            Funds
          </h1>

          <p>
            Manage your virtual trading funds.
          </p>
        </div>
      </div>

     <FundsCard
  balance={balance}
  portfolioValue={portfolioValue}
  totalAccountValue={totalAccountValue}
  formatMoney={formatMoney}
/>
    </>
  );

  /*
  ==================================================
  PAGE ROUTER
  ==================================================
  */

  const renderPage = () => {
    switch (activePage) {
      case "Dashboard":
        return renderDashboard();

      case "Market Watch":
        return renderMarketWatch();

      case "Holdings":
        return renderHoldings();

      case "Orders":
        return renderOrders();

      case "Transactions":
        return renderTransactions();

      case "Admin Dashboard":
        return isAdmin
          ? <AdminDashboard token={token} />
          : renderDashboard();

      case "Funds":
        return renderFunds();

      default:
        return renderDashboard();
    }
  };

 if (!token) {
  return (
    <AuthScreen
      isRegister={isRegister}
      setIsRegister={setIsRegister}
      loginForm={loginForm}
      setLoginForm={setLoginForm}
      registerForm={registerForm}
      setRegisterForm={setRegisterForm}
      handleLogin={handleLogin}
      handleRegister={handleRegister}
      loading={loading}
    />
  );
}

  return (
    <div className={`broker-app ${theme}-theme`}>

      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        userName={userName}
        logout={logout}
        isAdmin={isAdmin}
      />

      {/* MAIN */}

      <main className="broker-main">

        {/* TOP BAR */}

        <TopBar
          search={search}
          setSearch={setSearch}
          theme={theme}
          toggleTheme={toggleTheme}
          balance={balance}
          userName={userName}
          formatCompactMoney={formatCompactMoney}
        />

        {/* PAGE */}

        <div className="broker-content">
          {renderPage()}
        </div>

        <footer className="broker-footer">
          <span>
            <strong>DALALX</strong>
          </span>

          <span>
            Virtual Market Experience
          </span>

          <span>
            Learn â€¢ Trade â€¢ Experience
          </span>
        </footer>

      </main>

      {/* ORDER MODAL */}

      {showOrderModal &&
        selectedStock && (
          <div className="order-overlay">

            <div className="order-window">

              <div className="order-window-header">

                <div>
                  <span>
                    {orderType ===
                    "BUY"
                      ? "BUY ORDER"
                      : "SELL ORDER"}
                  </span>

                  <h2>
                    {selectedStock.symbol}
                  </h2>

                  <p>
                    {
                      selectedStock.company_name
                    }
                  </p>
                </div>

                <button
                  className="modal-close"
                  onClick={() =>
                    setShowOrderModal(
                      false
                    )
                  }
                >
                  ×
                </button>

              </div>

              <div className="order-live-price">

                <div>
                  <span>
                    Last traded price
                  </span>

                  <strong>
                    ₹
                    {formatMoney(
                      getCurrentPrice(
                        selectedStock
                      )
                    )}
                  </strong>
                </div>

                <div
                  className={
                    Number(
                      selectedStock.change_percent
                    ) >= 0
                      ? "green"
                      : "red"
                  }
                >
                  {Number(
                    selectedStock.change_percent
                  ) >= 0
                    ? "+"
                    : ""}
                  {Number(
                    selectedStock.change_percent
                  ).toFixed(2)}
                  %
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
                    setOrderType(
                      "BUY"
                    )
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
                    setOrderType(
                      "SELL"
                    )
                  }
                >
                  SELL
                </button>

              </div>

              <label>
                Quantity
              </label>

              <input
                className="order-quantity"
                type="number"
                min="1"
                value={quantity}
                onChange={(e) =>
                  setQuantity(
                    Number(
                      e.target.value
                    )
                  )
                }
              />

              <div className="order-summary">

                <div>
                  <span>
                    Estimated value
                  </span>

                  <strong>
                    ₹
                    {formatMoney(
                      getCurrentPrice(
                        selectedStock
                      ) *
                        Number(
                          quantity || 0
                        )
                    )}
                  </strong>
                </div>

                <div>
                  <span>
                    Available funds
                  </span>

                  <strong>
                    ₹
                    {formatMoney(
                      balance
                    )}
                  </strong>
                </div>

              </div>

              <button
                className={
                  orderType === "BUY"
                    ? "place-buy"
                    : "place-sell"
                }
                onClick={
                  placeOrder
                }
                disabled={loading}
              >
                {loading
                  ? "Processing..."
                  : `Confirm ${orderType}`}
              </button>

              <p className="order-note">
                This is a virtual order for
                educational purposes.
              </p>

            </div>

          </div>
        )}

    </div>
  );
}

export default App;

