
function Sidebar({
  activePage,
  setActivePage,
  userName,
  logout,
  isAdmin = false
}) {
  const menuItems = [
    {
      name: "Dashboard",
      icon: "⌂"
    },
    {
      name: "Market Watch",
      icon: "◉"
    },
    {
      name: "Holdings",
      icon: "▥"
    },
    {
      name: "Orders",
      icon: "↕"
    },
    {
      name: "Transactions",
      icon: "▤"
    },
    {
      name: "Funds",
      icon: "₹"
    }
  ];

  // Only admins can see the Admin Dashboard menu
  if (isAdmin) {
    menuItems.push({
      name: "Admin Dashboard",
      icon: "⚙"
    });
  }

  return (
    <aside className="broker-sidebar">
      <div className="broker-logo">
        <div className="brand-mark small-mark">
          DX
        </div>

        <div>
          <strong>DALALX</strong>
          <span>VIRTUAL MARKET</span>
        </div>
      </div>

      <div className="sidebar-section-title">
        MENU
      </div>

      <nav className="broker-nav">
        {menuItems.map((item) => (
          <button
            key={item.name}
            className={
              activePage === item.name
                ? "broker-nav-item active"
                : "broker-nav-item"
            }
            onClick={() => setActivePage(item.name)}
          >
            <span className="nav-icon">
              {item.icon}
            </span>

            <span>{item.name}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="user-avatar">
            {userName
              ? userName.substring(0, 1).toUpperCase()
              : "U"}
          </div>

          <div>
            <strong>{userName}</strong>
            <span>
              {isAdmin ? "Administrator" : "Virtual Trader"}
            </span>
          </div>
        </div>

        <button
          className="sidebar-logout"
          onClick={logout}
        >
          Logout
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
