import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const Menu = () => {
  const [selectedMenu, setSelectedMenu] = useState(0);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [username, setUsername] = useState("User");

  useEffect(() => {
    // Fetch username from auth
    const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:3002";
    axios
      .get(`${apiUrl}/verify`, { withCredentials: true })
      .then((res) => {
        if (res.data.status) {
          setUsername(res.data.user);
        }
      })
      .catch(() => {});
  }, []);

  const handleMenuClick = (index) => {
    setSelectedMenu(index);
  };

  const handleProfileClick = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };

  const handleLogout = async () => {
    try {
      const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:3002";
      await axios.post(
        `${apiUrl}/logout`,
        {},
        { withCredentials: true }
      );
    } catch (err) {
      console.error("Logout failed:", err);
    }
    window.location.href = process.env.REACT_APP_FRONTEND_URL || "http://localhost:3000";
  };

  const menuClass = "menu";
  const activeMenuClass = "menu selected";

  // Generate avatar initials
  const initials = username
    ? username.slice(0, 2).toUpperCase()
    : "ZU";

  return (
    <div className="menu-container">
      <img src="logo.png" alt="Logo" style={{ width: "50px" }} />
      <div className="menus">
        <ul>
          <li>
            <Link
              style={{ textDecoration: "none" }}
              to="/"
              onClick={() => handleMenuClick(0)}
            >
              <p className={selectedMenu === 0 ? activeMenuClass : menuClass}>
                Dashboard
              </p>
            </Link>
          </li>
          <li>
            <Link
              style={{ textDecoration: "none" }}
              to="/orders"
              onClick={() => handleMenuClick(1)}
            >
              <p className={selectedMenu === 1 ? activeMenuClass : menuClass}>
                Orders
              </p>
            </Link>
          </li>
          <li>
            <Link
              style={{ textDecoration: "none" }}
              to="/holdings"
              onClick={() => handleMenuClick(2)}
            >
              <p className={selectedMenu === 2 ? activeMenuClass : menuClass}>
                Holdings
              </p>
            </Link>
          </li>
          <li>
            <Link
              style={{ textDecoration: "none" }}
              to="/positions"
              onClick={() => handleMenuClick(3)}
            >
              <p className={selectedMenu === 3 ? activeMenuClass : menuClass}>
                Positions
              </p>
            </Link>
          </li>
          <li>
            <Link
              style={{ textDecoration: "none" }}
              to="/funds"
              onClick={() => handleMenuClick(4)}
            >
              <p className={selectedMenu === 4 ? activeMenuClass : menuClass}>
                Funds
              </p>
            </Link>
          </li>
          <li>
            <Link
              style={{ textDecoration: "none" }}
              to="/apps"
              onClick={() => handleMenuClick(6)}
            >
              <p className={selectedMenu === 6 ? activeMenuClass : menuClass}>
                Apps
              </p>
            </Link>
          </li>
        </ul>
        <hr />

        {/* Back to TradeX Home */}
        <a
          href={process.env.REACT_APP_FRONTEND_URL || "http://localhost:3000"}
          className="home-link"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px 16px",
            marginBottom: "8px",
            color: "#4184f3",
            textDecoration: "none",
            fontSize: "0.85rem",
            fontWeight: "500",
            borderRadius: "4px",
            transition: "background 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#f0f4ff")}
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = "transparent")
          }
        >
          ← TradeX Home
        </a>

        <div className="profile" onClick={handleProfileClick}>
          <div className="avatar">{initials}</div>
          <p className="username">{username}</p>
        </div>

        {/* Logout button */}
        {isProfileDropdownOpen && (
          <div
            style={{
              padding: "8px 16px",
              marginTop: "4px",
            }}
          >
            <button
              onClick={handleLogout}
              style={{
                width: "100%",
                padding: "8px 16px",
                background: "#fee2e2",
                color: "#dc2626",
                border: "1px solid #fecaca",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "0.85rem",
                fontWeight: "500",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) => (e.target.style.background = "#fecaca")}
              onMouseLeave={(e) => (e.target.style.background = "#fee2e2")}
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Menu;
