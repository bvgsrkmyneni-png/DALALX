import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import "./AdminDashboard.css";

const API = "http://localhost:5000/api/stocks";

const EMPTY_FORM = {
  symbol: "",
  company_name: "",
  current_price: ""
};

const money = (value) =>
  Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

function AdminDashboard({ token }) {
  const [stocks, setStocks] = useState([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [notice, setNotice] = useState(null);

  const loadStocks = useCallback(async () => {
    setFetching(true);

    try {
      const response = await axios.get(API);
      setStocks(response.data.stocks || []);
    } catch (error) {
      console.error("Load stocks:", error);
      setNotice({
        type: "error",
        text: "Unable to load companies. Check your backend."
      });
    } finally {
      setFetching(false);
    }
  }, []);

  useEffect(() => {
    loadStocks();
  }, [loadStocks]);

  const stats = useMemo(() => {
    const rising = stocks.filter(
      (s) => Number(s.change_percent || 0) > 0
    ).length;

    const falling = stocks.filter(
      (s) => Number(s.change_percent || 0) < 0
    ).length;

    const average = stocks.length
      ? stocks.reduce(
          (sum, s) => sum + Number(s.current_price || 0),
          0
        ) / stocks.length
      : 0;

    return {
      total: stocks.length,
      rising,
      falling,
      average
    };
  }, [stocks]);

  const filteredStocks = useMemo(() => {
    const query = search.trim().toLowerCase();

    return stocks.filter(
      (stock) =>
        stock.symbol.toLowerCase().includes(query) ||
        stock.company_name.toLowerCase().includes(query)
    );
  }, [stocks, search]);

  const resetForm = () => {
    setEditingId(null);
    setForm({ ...EMPTY_FORM });
  };

  const editCompany = (stock) => {
    setEditingId(stock.stock_id);
    setForm({
      symbol: stock.symbol,
      company_name: stock.company_name,
      current_price: String(stock.current_price)
    });
    setNotice(null);

    document
      .getElementById("apple-company-form")
      ?.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const symbol = form.symbol.trim().toUpperCase();
    const name = form.company_name.trim();
    const price = Number(form.current_price);

    if (!/^[A-Z0-9.-]{1,20}$/.test(symbol)) {
      setNotice({
        type: "error",
        text: "Please enter a valid stock symbol."
      });
      return;
    }

    if (name.length < 2 || name.length > 150) {
      setNotice({
        type: "error",
        text: "Company name must be 2–150 characters."
      });
      return;
    }

    if (
      form.current_price.trim() === "" ||
      !Number.isFinite(price) ||
      price <= 0
    ) {
      setNotice({
        type: "error",
        text: "Please enter a positive stock price."
      });
      return;
    }

    setLoading(true);
    setNotice(null);

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };

      const payload = {
        company_name: name,
        current_price: price
      };

      let response;

      if (editingId !== null) {
        response = await axios.put(
          `${API}/${editingId}`,
          payload,
          config
        );
      } else {
        response = await axios.post(
          API,
          { ...payload, symbol },
          config
        );
      }

      setNotice({
        type: "success",
        text:
          response.data.message ||
          "Company saved successfully."
      });

      resetForm();
      await loadStocks();
    } catch (error) {
      setNotice({
        type: "error",
        text:
          error.response?.data?.message ||
          "Unable to save company."
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="apple-admin">
      <header className="apple-admin-header">
        <div>
          <div className="apple-eyebrow">
            <span className="apple-status-dot" />
            DALALX ADMINISTRATION
          </div>

          <h1>Overview</h1>

          <p>
            Everything you need to manage your virtual market.
          </p>
        </div>

        <a href="#apple-company-form" className="apple-add-link">
          <span>+</span> New Company
        </a>
      </header>

      <div className="apple-stats">
        <article className="apple-stat">
          <div className="apple-stat-icon">▦</div>
          <span>Listed Companies</span>
          <strong>{stats.total}</strong>
          <small>Available on DALALX</small>
        </article>

        <article className="apple-stat">
          <div className="apple-stat-icon apple-green">↗</div>
          <span>Gainers</span>
          <strong>{stats.rising}</strong>
          <small>Stocks trading higher</small>
        </article>

        <article className="apple-stat">
          <div className="apple-stat-icon apple-red">↘</div>
          <span>Decliners</span>
          <strong>{stats.falling}</strong>
          <small>Stocks trading lower</small>
        </article>

        <article className="apple-stat">
          <div className="apple-stat-icon apple-blue">₹</div>
          <span>Average Share Price</span>
          <strong className="apple-money">
            ₹{money(stats.average)}
          </strong>
          <small>Across all listings</small>
        </article>
      </div>

      <div className="apple-main-grid">
        <section className="apple-card" id="apple-company-form">
          <div className="apple-card-header">
            <div>
              <div className="apple-section-label">
                COMPANY MANAGEMENT
              </div>

              <h2>
                {editingId !== null
                  ? "Edit company"
                  : "Add a company"}
              </h2>

              <p>
                {editingId !== null
                  ? "Make changes to an existing listing."
                  : "Create a new listing on your exchange."}
              </p>
            </div>

            <div className="apple-header-icon">
              {editingId !== null ? "✎" : "+"}
            </div>
          </div>

          <form className="apple-form" onSubmit={handleSubmit}>
            <label>
              Stock symbol
              <input
                required
                maxLength={20}
                disabled={editingId !== null}
                value={form.symbol}
                placeholder="e.g. DXTECH"
                onChange={(event) =>
                  setForm({
                    ...form,
                    symbol: event.target.value.toUpperCase()
                  })
                }
              />
            </label>

            <label>
              Company name
              <input
                required
                maxLength={150}
                value={form.company_name}
                placeholder="e.g. DALALX Technologies"
                onChange={(event) =>
                  setForm({
                    ...form,
                    company_name: event.target.value
                  })
                }
              />
            </label>

            <label>
              Share price (₹)
              <input
                required
                type="number"
                min="0.01"
                step="0.01"
                value={form.current_price}
                placeholder="111.00"
                onChange={(event) =>
                  setForm({
                    ...form,
                    current_price: event.target.value
                  })
                }
              />
            </label>

            <button
              className="apple-primary-button"
              type="submit"
              disabled={loading}
            >
              {loading
                ? "Saving..."
                : editingId !== null
                ? "Save changes"
                : "Add company"}
            </button>

            {editingId !== null && (
              <button
                className="apple-text-button"
                type="button"
                onClick={resetForm}
              >
                Cancel editing
              </button>
            )}

            {notice && (
              <div
                className={`apple-notice ${notice.type}`}
                role="status"
              >
                {notice.text}
              </div>
            )}
          </form>
        </section>

        <section className="apple-card apple-market-panel">
  <div className="apple-market-heading">
    <div>
      <div className="apple-section-label">
        MARKET INTELLIGENCE
      </div>
      <h2>Live Market Overview</h2>
      <p>Insights from your listed stocks.</p>
    </div>

    <button
      type="button"
      className="apple-refresh"
      disabled={fetching}
      onClick={loadStocks}
    >
      {fetching ? "Refreshing..." : "↻ Refresh"}
    </button>
  </div>

  <div className="apple-market-section">
    <div className="apple-market-title">
      <span className="apple-market-indicator gain" />
      Top Gainers
    </div>

    {[...stocks]
      .filter(s => Number(s.change_percent) > 0)
      .sort(
        (a, b) =>
          Number(b.change_percent) -
          Number(a.change_percent)
      )
      .slice(0, 3)
      .map(stock => (
        <div
          className="apple-market-item"
          key={stock.stock_id}
        >
          <div>
            <strong>{stock.symbol}</strong>
            <small>{stock.company_name}</small>
          </div>

          <div className="apple-market-values">
            <strong>₹{money(stock.current_price)}</strong>
            <span className="apple-market-up">
              +{Number(stock.change_percent).toFixed(2)}%
            </span>
          </div>
        </div>
      ))}

    {!stocks.some(s => Number(s.change_percent) > 0) && (
      <p className="apple-market-empty">
        No gaining stocks currently.
      </p>
    )}
  </div>

  <div className="apple-market-section">
    <div className="apple-market-title">
      <span className="apple-market-indicator loss" />
      Top Losers
    </div>

    {[...stocks]
      .filter(s => Number(s.change_percent) < 0)
      .sort(
        (a, b) =>
          Number(a.change_percent) -
          Number(b.change_percent)
      )
      .slice(0, 3)
      .map(stock => (
        <div
          className="apple-market-item"
          key={stock.stock_id}
        >
          <div>
            <strong>{stock.symbol}</strong>
            <small>{stock.company_name}</small>
          </div>

          <div className="apple-market-values">
            <strong>₹{money(stock.current_price)}</strong>
            <span className="apple-market-down">
              {Number(stock.change_percent).toFixed(2)}%
            </span>
          </div>
        </div>
      ))}

    {!stocks.some(s => Number(s.change_percent) < 0) && (
      <p className="apple-market-empty">
        No declining stocks currently.
      </p>
    )}
  </div>

  <div className="apple-market-extremes">
    <div>
      <span>Highest Price</span>
      <strong>
        {stocks.length
          ? [...stocks].sort(
              (a, b) =>
                Number(b.current_price) -
                Number(a.current_price)
            )[0].symbol
          : "—"}
      </strong>
      <small>
        {stocks.length
          ? "₹" + money(
              Math.max(
                ...stocks.map(s => Number(s.current_price))
              )
            )
          : "No stocks"}
      </small>
    </div>

    <div>
      <span>Lowest Price</span>
      <strong>
        {stocks.length
          ? [...stocks].sort(
              (a, b) =>
                Number(a.current_price) -
                Number(b.current_price)
            )[0].symbol
          : "—"}
      </strong>
      <small>
        {stocks.length
          ? "₹" + money(
              Math.min(
                ...stocks.map(s => Number(s.current_price))
              )
            )
          : "No stocks"}
      </small>
    </div>
  </div>
</section>
      </div>

      <section className="apple-card apple-list" id="apple-company-list">
        <div className="apple-list-heading">
          <div>
            <div className="apple-section-label">
              YOUR EXCHANGE
            </div>

            <h2>Companies</h2>

            <p>
              Browse and update your listed companies.
            </p>
          </div>

          <button
            className="apple-refresh"
            type="button"
            disabled={fetching}
            onClick={loadStocks}
          >
            {fetching ? "Refreshing..." : "↻ Refresh"}
          </button>
        </div>

        <div className="apple-search-row">
          <div className="apple-search-wrap">
            <span>⌕</span>

            <input
              type="search"
              placeholder="Search companies..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
            />
          </div>

          <span className="apple-results">
            {filteredStocks.length} companies
          </span>
        </div>

        <div className="apple-table-scroll">
          <table className="apple-table">
            <thead>
              <tr>
                <th>COMPANY</th>
                <th>SYMBOL</th>
                <th>PRICE</th>
                <th>CHANGE</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              {filteredStocks.map((stock) => {
                const change = Number(
                  stock.change_percent || 0
                );

                return (
                  <tr key={stock.stock_id}>
                    <td>
                      <div className="apple-company-cell">
                        <div className="apple-avatar">
                          {stock.symbol.slice(0, 2)}
                        </div>

                        <strong>{stock.company_name}</strong>
                      </div>
                    </td>

                    <td>
                      <span className="apple-symbol">
                        {stock.symbol}
                      </span>
                    </td>

                    <td className="apple-price">
                      ₹{money(stock.current_price)}
                    </td>

                    <td>
                      <span
                        className={
                          change >= 0
                            ? "apple-change positive"
                            : "apple-change negative"
                        }
                      >
                        {change >= 0 ? "+" : ""}
                        {change.toFixed(2)}%
                      </span>
                    </td>

                    <td>
                      <button
                        className="apple-edit-button"
                        type="button"
                        onClick={() => editCompany(stock)}
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredStocks.length === 0 && (
            <div className="apple-empty">
              {fetching
                ? "Loading companies..."
                : "No companies found."}
            </div>
          )}
        </div>
      </section>

      <footer className="apple-admin-footer">
        <span>DALALX Virtual Stock Exchange</span>
        <span>Administration</span>
      </footer>
    </div>
  );
}

export default AdminDashboard;

