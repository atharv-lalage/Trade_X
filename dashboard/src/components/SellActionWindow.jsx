import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import GeneralContext from "./GeneralContext";
import { getQuote } from "../services/stockApi";
import "./SellActionWindow.css";

const SellActionWindow = ({ uid }) => {
  const [stockQuantity, setStockQuantity] = useState(1);
  const [stockPrice, setStockPrice] = useState(0.0);
  const [stockName, setStockName] = useState(uid);
  const [loading, setLoading] = useState(true);
  const [holdingQty, setHoldingQty] = useState(0);
  const [orderStatus, setOrderStatus] = useState(null); // null | 'placing' | 'success' | 'error'
  const [errorMsg, setErrorMsg] = useState("");
  const generalContext = useContext(GeneralContext);

  // Fetch real price + current holding qty
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch live price
        const quoteData = await getQuote(uid);
        setStockPrice(quoteData.price);
        setStockName(quoteData.name || uid);

        // Fetch current holding quantity for this stock
        const { data: holdings } = await axios.get(
          "http://localhost:3002/allHoldings",
          { withCredentials: true }
        );
        const holding = holdings.find((h) => h.symbol === uid);
        if (holding) {
          setHoldingQty(holding.qty);
          setStockQuantity(holding.qty); // default to full qty
        }
      } catch (error) {
        console.error("Failed to fetch stock data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [uid]);

  const handleSellClick = async () => {
    if (stockQuantity > holdingQty) {
      setOrderStatus("error");
      setErrorMsg(`You only hold ${holdingQty} shares of ${stockName}`);
      return;
    }
    if (stockQuantity <= 0) {
      setOrderStatus("error");
      setErrorMsg("Quantity must be at least 1");
      return;
    }

    setOrderStatus("placing");
    try {
      const { data } = await axios.post(
        "http://localhost:3002/newOrder",
        {
          symbol: uid,
          name: stockName,
          qty: stockQuantity,
          price: stockPrice,
          mode: "SELL",
        },
        { withCredentials: true }
      );
      if (data.success) {
        setOrderStatus("success");
        setTimeout(() => {
          generalContext.closeSellWindow();
          window.location.reload(); // refresh to show updated holdings
        }, 1200);
      } else {
        setOrderStatus("error");
        setErrorMsg(data.error || "Order failed");
      }
    } catch (err) {
      setOrderStatus("error");
      setErrorMsg(err.response?.data?.error || err.response?.data?.errors?.join(", ") || "Order failed");
    }
  };

  const handleCancelClick = () => {
    generalContext.closeSellWindow();
  };

  const totalValue = (stockQuantity * stockPrice).toFixed(2);

  return (
    <div className="container" id="sell-window" draggable="true">
      <div className="header sell-header">
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
        {holdingQty > 0 && (
          <div className="holding-info">
            You hold <strong>{holdingQty}</strong> shares of {stockName}
          </div>
        )}
        {holdingQty === 0 && !loading && (
          <div className="holding-info no-holding">
            You don't hold any shares of {stockName}
          </div>
        )}
        <div className="inputs">
          <fieldset>
            <legend>Qty.</legend>
            <input
              type="number"
              name="qty"
              id="sell-qty"
              min="1"
              max={holdingQty}
              onChange={(e) => setStockQuantity(Number(e.target.value))}
              value={stockQuantity}
            />
          </fieldset>
          <fieldset>
            <legend>Price</legend>
            <input
              type="number"
              name="price"
              id="sell-price"
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
          ✅ Shares sold successfully!
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
        <span>Estimated return ₹{loading ? "..." : totalValue}</span>
        <div>
          <button
            className="btn btn-orange"
            onClick={handleSellClick}
            disabled={loading || orderStatus === "placing" || holdingQty === 0}
          >
            {orderStatus === "placing" ? "Placing..." : "Sell"}
          </button>
          <button className="btn btn-grey" onClick={handleCancelClick}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default SellActionWindow;
