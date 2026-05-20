import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import GeneralContext from "./GeneralContext";
import { VerticalGraph } from "./VerticalGraph";

const Holdings = () => {
  const [allHoldings, setAllHoldings] = useState([]);
  const [loading, setLoading] = useState(true);
  const generalContext = useContext(GeneralContext);

  useEffect(() => {
    const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:3002";
    axios
      .get(`${apiUrl}/allHoldings`, { withCredentials: true })
      .then((res) => {
        setAllHoldings(res.data);
      })
      .catch((err) => console.error("Holdings fetch error:", err))
      .finally(() => setLoading(false));
  }, []);

  // Dynamic calculations from real data
  const totalInvestment = allHoldings.reduce(
    (sum, h) => sum + h.avg * h.qty,
    0
  );
  const currentValue = allHoldings.reduce(
    (sum, h) => sum + h.price * h.qty,
    0
  );
  const totalPnl = currentValue - totalInvestment;
  const pnlPercent =
    totalInvestment > 0 ? (totalPnl / totalInvestment) * 100 : 0;

  const formatCurrency = (num) =>
    num.toLocaleString("en-IN", { maximumFractionDigits: 2 });

  // Chart data
  const labels = allHoldings.map((h) => h.name);
  const data = {
    labels,
    datasets: [
      {
        label: "Current Value (₹)",
        data: allHoldings.map((h) => (h.price * h.qty).toFixed(2)),
        backgroundColor: "rgba(65, 132, 243, 0.5)",
      },
      {
        label: "Investment (₹)",
        data: allHoldings.map((h) => (h.avg * h.qty).toFixed(2)),
        backgroundColor: "rgba(255, 159, 64, 0.5)",
      },
    ],
  };

  if (loading) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "#888" }}>
        Loading holdings with live prices...
      </div>
    );
  }

  return (
    <>
      <h3 className="title">Holdings ({allHoldings.length})</h3>

      {allHoldings.length === 0 ? (
        <div
          style={{
            padding: "60px 20px",
            textAlign: "center",
            color: "#888",
          }}
        >
          <p style={{ fontSize: "1.1rem", marginBottom: "8px" }}>
            You don't have any holdings yet
          </p>
          <p style={{ fontSize: "0.9rem" }}>
            Buy stocks from the watchlist to build your portfolio
          </p>
        </div>
      ) : (
        <>
          <div className="order-table">
            <table>
              <thead>
                <tr>
                  <th>Instrument</th>
                  <th>Qty.</th>
                  <th>Avg. cost</th>
                  <th>LTP</th>
                  <th>Cur. val</th>
                  <th>P&amp;L</th>
                  <th>Net chg.</th>
                  <th>Day chg.</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {allHoldings.map((stock, index) => {
                  const curValue = stock.price * stock.qty;
                  const pnl = curValue - stock.avg * stock.qty;
                  const isProfit = pnl >= 0;
                  const profClass = isProfit ? "profit" : "loss";
                  const dayClass = stock.isLoss ? "loss" : "profit";

                  return (
                    <tr key={stock._id || index}>
                      <td>{stock.name}</td>
                      <td>{stock.qty}</td>
                      <td>{stock.avg.toFixed(2)}</td>
                      <td>{stock.price.toFixed(2)}</td>
                      <td>{formatCurrency(curValue)}</td>
                      <td className={profClass}>{formatCurrency(pnl)}</td>
                      <td className={profClass}>{stock.net}</td>
                      <td className={dayClass}>{stock.day}</td>
                      <td>
                        <button
                          onClick={() => generalContext.openSellWindow(stock.symbol)}
                          style={{
                            background: "#e74c3c",
                            color: "#fff",
                            border: "none",
                            padding: "4px 12px",
                            borderRadius: "3px",
                            cursor: "pointer",
                            fontSize: "0.75rem",
                            fontWeight: 500,
                          }}
                        >
                          Sell
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="row">
            <div className="col">
              <h5>{formatCurrency(totalInvestment)}</h5>
              <p>Total investment</p>
            </div>
            <div className="col">
              <h5>{formatCurrency(currentValue)}</h5>
              <p>Current value</p>
            </div>
            <div className="col">
              <h5 className={totalPnl >= 0 ? "profit" : "loss"}>
                {formatCurrency(totalPnl)} ({pnlPercent >= 0 ? "+" : ""}
                {pnlPercent.toFixed(2)}%)
              </h5>
              <p>P&amp;L</p>
            </div>
          </div>
          <VerticalGraph data={data} />
        </>
      )}
    </>
  );
};

export default Holdings;
