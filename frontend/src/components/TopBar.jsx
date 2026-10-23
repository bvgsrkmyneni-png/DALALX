function TopBar({
  search,
  setSearch,
  theme,
  toggleTheme,
  balance,
  userName,
  formatCompactMoney
}) {
  return (
    <header className="broker-topbar">

        <div className="top-search">

          <span>
            ⌕
          </span>

          <input
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
            placeholder="Search stocks..."
          />

          <kbd>
            /
          </kbd>

        </div>

        <div className="top-right">

          <button
            className="theme-toggle"
            onClick={toggleTheme}
            type="button"
            title={
              theme === "light"
                ? "Switch to dark theme"
                : "Switch to light theme"
            }
          >
            {theme === "light"
              ? "🌙 Dark"
              : "☀️ Light"}
          </button>

          <div className="top-market-status">
            <span className="pulse-dot"></span>
            LIVE
          </div>

          <div className="top-funds">
            <span>
              Funds
            </span>

            <strong>
              ₹
              {formatCompactMoney(
                balance
              ).replace("₹", "")}
            </strong>
          </div>

          <div className="top-user">
            {userName
              .substring(0, 1)
              .toUpperCase()}
          </div>

        </div>

    </header>
  );
}

export default TopBar;
