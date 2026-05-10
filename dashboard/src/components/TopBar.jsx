import React, { useState, useEffect } from "react";
import Menu from "./Menu";
import { getIndices } from "../services/stockApi";

const TopBar = () => {
  const [indices, setIndices] = useState({
    nifty: { name: "NIFTY 50", price: 0, change: 0, changePercent: 0, isDown: false },
    sensex: { name: "SENSEX", price: 0, change: 0, changePercent: 0, isDown: false },
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIndices = async () => {
      try {
        const data = await getIndices();
        setIndices(data);
      } catch (error) {
        console.error("Failed to fetch indices:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchIndices();

    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchIndices, 30000);
    return () => clearInterval(interval);
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
      </div>

      <Menu />
    </div>
  );
};

export default TopBar;
