import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import axios from "axios";
import "./index.css";
import Home from "./components/Home";

const AuthGuard = () => {
  const [authState, setAuthState] = useState("loading"); // loading | authenticated | unauthorized
  const [username, setUsername] = useState("");

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:3002";
        const { data } = await axios.get(`${apiUrl}/verify`, {
          withCredentials: true,
        });
        if (data.status) {
          setAuthState("authenticated");
          setUsername(data.user);
        } else {
          setAuthState("unauthorized");
        }
      } catch (error) {
        console.error("Auth verification failed:", error);
        setAuthState("unauthorized");
      }
    };
    verifyAuth();
  }, []);

  if (authState === "loading") {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          background: "#f5f7fa",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              border: "4px solid #e0e0e0",
              borderTop: "4px solid #4184f3",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
              margin: "0 auto 16px",
            }}
          />
          <p style={{ color: "#666", fontSize: "1rem" }}>
            Verifying authentication...
          </p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  if (authState === "unauthorized") {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          background: "linear-gradient(135deg, #f5f7fa 0%, #e4e9f2 100%)",
        }}
      >
        <div
          style={{
            textAlign: "center",
            background: "#fff",
            padding: "48px 40px",
            borderRadius: "16px",
            boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
            maxWidth: "420px",
          }}
        >
          <div
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "50%",
              background: "#fee2e2",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px",
              fontSize: "1.8rem",
            }}
          >
            🔒
          </div>
          <h2
            style={{
              margin: "0 0 12px",
              color: "#1a1a2e",
              fontSize: "1.5rem",
              fontWeight: "600",
            }}
          >
            Access Denied
          </h2>
          <p
            style={{
              color: "#666",
              fontSize: "0.95rem",
              lineHeight: "1.6",
              margin: "0 0 28px",
            }}
          >
            You need to be logged in to access the TradeX Dashboard.
            <br />
            Please login or create an account first.
          </p>
          <a
            href={`${process.env.REACT_APP_FRONTEND_URL || "http://localhost:3000"}/signup`}
            style={{
              display: "inline-block",
              background: "#4184f3",
              color: "#fff",
              padding: "12px 32px",
              borderRadius: "8px",
              textDecoration: "none",
              fontSize: "1rem",
              fontWeight: "500",
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) => (e.target.style.background = "#3070e0")}
            onMouseLeave={(e) => (e.target.style.background = "#4184f3")}
          >
            Go to Login
          </a>
          <br />
          <a
            href={process.env.REACT_APP_FRONTEND_URL || "http://localhost:3000"}
            style={{
              display: "inline-block",
              marginTop: "12px",
              color: "#4184f3",
              textDecoration: "none",
              fontSize: "0.9rem",
            }}
          >
            ← Back to TradeX Home
          </a>
        </div>
      </div>
    );
  }

  // Authenticated — render the dashboard
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/*" element={<Home username={username} />} />
      </Routes>
    </BrowserRouter>
  );
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <AuthGuard />
  </React.StrictMode>
);
