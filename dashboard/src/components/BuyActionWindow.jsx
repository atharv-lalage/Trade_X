import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import GeneralContext from "./GeneralContext";
import { getQuote } from "../services/stockApi";
import "./BuyActionWindow.css";

const BuyActionWindow = ({ uid }) => {
  const [stockQuantity, setStockQuantity] = useState(1);
  const [stockPrice, setStockPrice] = useState(0.0);
  const [stockName, setStockName] = useState(uid);
  const [loading, setLoading] = useState(true);
  const [orderStatus, setOrderStatus] = useState(null); // null | 'placing' | 'success' | 'error'
  const [errorMsg, setErrorMsg] = useState("");
  const generalContext = useContext(GeneralContext);

  // Fetch real price for the selected stock
  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const data = await getQuote(uid);
        setStockPrice(data.price);
        setStockName(data.name || uid);
      } catch (error) {
        console.error("Failed to fetch stock price:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPrice();
  }, [uid]);

  const handleBuyClick = async () => {
    setOrderStatus("placing");
    try {
      const { data } = await axios.post(
        "http://localhost:3002/newOrder",
        {
          symbol: uid,
          name: stockName,
          qty: stockQuantity,
          price: stockPrice,
          mode: "BUY",
        },
        { withCredentials: true }
      );
      if (data.success) {
        setOrderStatus("success");
        setTimeout(() => {
          generalContext.closeBuyWindow();
          window.location.reload(); // refresh to show updated holdings
        }, 1200);
      } else {
        setOrderStatus("error");
        setErrorMsg(data.error || "Order failed");
      }
    } catch (err) {
      setOrderStatus("error");
      setErrorMsg(err.response?.data?.error || "Order failed");
    }
  };

  const handleCancelClick = () => {
    generalContext.closeBuyWindow();
  };

  const totalValue = (stockQuantity * stockPrice).toFixed(2);

  return (
    <div className="container" id="buy-window" draggable="true">
      <div className="header">
        <h3>
          {stockName} <span>{uid}</span>
        </h3>
        <div className="market-options">
          <label>
            <input type="radio" name="market" defaultChecked /> NSE
          </label>
          <label style={{ marginLeft: "12px" }}>
            <input type="radio" name="market" /> BSE
          </label>
        </div>
      </div>

      <div className="regular-order">
        <div className="inputs">
          <fieldset>
            <legend>Qty.</legend>
            <input
              type="number"
              name="qty"
              id="qty"
              min="1"
              onChange={(e) => setStockQuantity(Number(e.target.value))}
              value={stockQuantity}
            />
          </fieldset>
          <fieldset>
            <legend>Price</legend>
            <input
              type="number"
              name="price"
              id="price"
              step="0.05"
              onChange={(e) => setStockPrice(Number(e.target.value))}
              value={loading ? "..." : stockPrice}
            />
          </fieldset>
        </div>
      </div>

      {orderStatus === "success" && (
        <div
          style={{
            padding: "8px 20px",
            background: "#d4edda",
            color: "#155724",
            fontSize: "0.85rem",
            textAlign: "center",
          }}
        >
          ✅ Order placed successfully!
        </div>
      )}
      {orderStatus === "error" && (
        <div
          style={{
            padding: "8px 20px",
            background: "#f8d7da",
            color: "#721c24",
            fontSize: "0.85rem",
            textAlign: "center",
          }}
        >
          ❌ {errorMsg}
        </div>
      )}

      <div className="buttons">
        <span>Margin required ₹{loading ? "..." : totalValue}</span>
        <div>
          <button
            className="btn btn-blue"
            onClick={handleBuyClick}
            disabled={loading || orderStatus === "placing"}
          >
            {orderStatus === "placing" ? "Placing..." : "Buy"}
          </button>
          <button className="btn btn-grey" onClick={handleCancelClick}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default BuyActionWindow;
