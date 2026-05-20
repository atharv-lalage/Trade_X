import React, { useState, useEffect } from "react";
import Menu from "./Menu";
import { io } from "socket.io-client";

// Create a single socket connection (shared across the app)
const socket = io(process.env.REACT_APP_API_URL || "http://localhost:3002", {
  withCredentials: true,
  transports: ["websocket", "polling"],
});

export { socket }; // export for use in other components

const TopBar = () => {
  const [indices, setIndices] = useState({
    nifty: { name: "NIFTY 50", price: 0, change: 0, changePercent: 0, isDown: false },
    sensex: { name: "SENSEX", price: 0, change: 0, changePercent: 0, isDown: false },
  });
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // Listen for real-time index updates from the server
    socket.on("indicesUpdate", (data) => {
      setIndices(data);
      setLoading(false);
      setConnected(true);
    });

    socket.on("connect", () => {
      console.log("[Socket.io] Connected to server:", socket.id);
      setConnected(true);
    });

    socket.on("disconnect", () => {
      console.log("[Socket.io] Disconnected from server");
      setConnected(false);
    });

    // Cleanup on unmount
    return () => {
      socket.off("indicesUpdate");
      socket.off("connect");
      socket.off("disconnect");
    };
  }, []);

  const formatNumber = (num) => {
    if (!num && num !== 0) return "—";
    return num.toLocaleString("en-IN", { maximumFractionDigits: 2 });
  };

  const formatPercent = (num) => {
    if (!num && num !== 0) return "";
    const sign = num >= 0 ? "+" : "";
    return `${sign}${num.toFixed(2)}%`;
  };

  return (
    <div className="topbar-container">
      <div className="indices-container">
        <div className="nifty">
          <p className="index">{indices.nifty.name}</p>
          {loading ? (
            <p className="index-points" style={{ opacity: 0.5 }}>Loading...</p>
          ) : (
            <>
              <p className={`index-points ${indices.nifty.isDown ? "down" : "up"}`}>
                {formatNumber(indices.nifty.price)}
              </p>
              <p className={`percent ${indices.nifty.isDown ? "down" : "up"}`}>
                {formatPercent(indices.nifty.changePercent)}
              </p>
            </>
          )}
        </div>
        <div className="sensex">
          <p className="index">{indices.sensex.name}</p>
          {loading ? (
            <p className="index-points" style={{ opacity: 0.5 }}>Loading...</p>
          ) : (
            <>
              <p className={`index-points ${indices.sensex.isDown ? "down" : "up"}`}>
                {formatNumber(indices.sensex.price)}
              </p>
              <p className={`percent ${indices.sensex.isDown ? "down" : "up"}`}>
                {formatPercent(indices.sensex.changePercent)}
              </p>
            </>
          )}
        </div>
        {/* Connection indicator */}
        <div
          title={connected ? "Live • Real-time via WebSocket" : "Disconnected"}
          style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            background: connected ? "#27ae60" : "#e74c3c",
            marginLeft: "12px",
            flexShrink: 0,
          }}
        />
      </div>

      <Menu />
    </div>
  );
};

export default TopBar;
