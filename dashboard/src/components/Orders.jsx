import React, { useState, useEffect } from "react";
import axios from "axios";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("http://localhost:3002/allOrders", { withCredentials: true })
      .then((res) => setOrders(res.data))
      .catch((err) => console.error("Orders fetch error:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "#888" }}>
        Loading orders...
      </div>
    );
  }

  return (
    <>
      <h3 className="title">Orders ({orders.length})</h3>

      {orders.length === 0 ? (
        <div className="orders">
          <div className="no-orders">
            <p>You haven't placed any orders yet</p>
            <p style={{ fontSize: "0.9rem", color: "#888", marginTop: "8px" }}>
              Buy or sell stocks from the watchlist to see your order history
            </p>
          </div>
        </div>
      ) : (
        <div className="order-table">
          <table>
            <thead>
              <tr>
                <th>Time</th>
                <th>Type</th>
                <th>Instrument</th>
                <th>Qty.</th>
                <th>Price</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order, index) => (
                <tr key={order._id || index}>
                  <td>
                    {new Date(order.createdAt).toLocaleString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td>
                    <span
                      style={{
                        color: order.mode === "BUY" ? "#4184f3" : "#e74c3c",
                        fontWeight: "600",
                      }}
                    >
                      {order.mode}
                    </span>
                  </td>
                  <td>{order.name}</td>
                  <td>{order.qty}</td>
                  <td>₹{order.price.toFixed(2)}</td>
                  <td>
                    <span
                      style={{
                        color: "#27ae60",
                        fontSize: "0.85rem",
                        fontWeight: "500",
                      }}
                    >
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
};

export default Orders;
