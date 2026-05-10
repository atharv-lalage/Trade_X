import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");

  useEffect(() => {
    // Verify auth status via cookie (not localStorage)
    axios
      .get("http://localhost:3002/verify", { withCredentials: true })
      .then((res) => {
        if (res.data.status) {
          setIsLoggedIn(true);
          setUsername(res.data.user);
        }
      })
      .catch(() => {
        setIsLoggedIn(false);
      });
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post(
        "http://localhost:3002/logout",
        {},
        { withCredentials: true }
      );
    } catch (err) {
      console.error("Logout error:", err);
    }
    setIsLoggedIn(false);
    setUsername("");
    window.location.href = "/";
  };

  return (
    <nav
      className="navbar border-bottom sticky-top"
      style={{
        backgroundColor: "#FFF",
        paddingTop: "0.5rem",
        paddingBottom: "0.5rem",
        minHeight: "56px",
      }}
    >
      <div
        className="container d-flex justify-content-center align-items-center"
        style={{ gap: "25.5rem" }}
      >
        {/* Logo */}
        <Link className="navbar-brand d-flex align-items-center m-0" to="/">
          <span
            style={{
              fontWeight: 600,
              color: "#3b82f6",
              fontSize: "1.75rem",
              letterSpacing: "1px",
            }}
          >
            TradeX
          </span>
        </Link>
        {/* Nav Links */}
        <ul
          className="navbar-nav flex-row mb-0 align-items-center"
          style={{ gap: "32px", fontSize: "1rem" }}
        >
          <li className="nav-item">
            <Link className="nav-link" to="/about">
              About
            </Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="/product">
              Product
            </Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="/pricing">
              Pricing
            </Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="/support">
              Support
            </Link>
          </li>
          {isLoggedIn && (
            <li className="nav-item">
              <a
                className="nav-link"
                href="http://localhost:3001"
                style={{
                  cursor: "pointer",
                  color: "#4184f3",
                  fontWeight: "500",
                }}
              >
                Dashboard
              </a>
            </li>
          )}
          {isLoggedIn ? (
            <li className="nav-item d-flex align-items-center gap-2">
              <span
                style={{
                  fontSize: "0.85rem",
                  color: "#666",
                }}
              >
                Hi, {username}
              </span>
              <button
                className="nav-link btn btn-link"
                style={{
                  color: "#dc2626",
                  textDecoration: "none",
                  fontSize: "0.9rem",
                }}
                onClick={handleLogout}
              >
                Logout
              </button>
            </li>
          ) : (
            <li className="nav-item">
              <Link className="nav-link" to="/signup">
                Login/Signup
              </Link>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
