import React, { useState, useEffect } from "react";
import axios from "axios";

const Summary = ({ username }) => {
  const [holdings, setHoldings] = useState([]);

  useEffect(() => {
    const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:3002";
    axios
      .get(`${apiUrl}/allHoldings`, { withCredentials: true })
      .then((res) => setHoldings(res.data))
      .catch((err) => console.error("Failed to fetch holdings:", err));
  }, []);

  // Calculate portfolio values
  const totalInvestment = holdings.reduce(
    (sum, h) => sum + (h.avg || 0) * (h.qty || 0),
    0
  );
  const currentValue = holdings.reduce(
    (sum, h) => sum + (h.price || 0) * (h.qty || 0),
    0
  );
  const pnl = currentValue - totalInvestment;
  const pnlPercent = totalInvestment > 0 ? (pnl / totalInvestment) * 100 : 0;
  const isProfit = pnl >= 0;

  const formatCurrency = (num) => {
    if (num >= 100000) return (num / 100000).toFixed(2) + "L";
    if (num >= 1000) return (num / 1000).toFixed(2) + "k";
    return num.toFixed(2);
  };

  return (
    <>
      <div className="username">
        <h6>Hi, {username || "User"}!</h6>
        <hr className="divider" />
      </div>

      <div className="section">
        <span>
          <p>Equity</p>
        </span>

        <div className="data">
          <div className="first">
            <h3>{formatCurrency(currentValue - totalInvestment + 3740)}</h3>
            <p>Margin available</p>
          </div>
          <hr />

          <div className="second">
            <p>
              Margins used <span>0</span>
            </p>
            <p>
              Opening balance <span>{formatCurrency(3740)}</span>
            </p>
          </div>
        </div>
        <hr className="divider" />
      </div>

      <div className="section">
        <span>
          <p>Holdings ({holdings.length})</p>
        </span>

        <div className="data">
          <div className="first">
            <h3 className={isProfit ? "profit" : "loss"}>
              {formatCurrency(Math.abs(pnl))}{" "}
              <small>
                {isProfit ? "+" : "-"}
                {Math.abs(pnlPercent).toFixed(2)}%
              </small>
            </h3>
            <p>P&amp;L</p>
          </div>
          <hr />

          <div className="second">
            <p>
              Current Value <span>{formatCurrency(currentValue)}</span>
            </p>
            <p>
              Investment <span>{formatCurrency(totalInvestment)}</span>
            </p>
          </div>
        </div>
        <hr className="divider" />
      </div>
    </>
  );
};

export default Summary;
