import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const Funds = () => {
  const [holdings, setHoldings] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:3002/allHoldings", { withCredentials: true })
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

  const formatCurrency = (num) => {
    return num.toLocaleString("en-IN", {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    });
  };

  const openingBalance = 3740.0;
  const availableMargin = openingBalance + currentValue - totalInvestment;

  return (
    <>
      <div className="funds">
        <p>Instant, zero-cost fund transfers with UPI </p>
        <Link className="btn btn-green">Add funds</Link>
        <Link className="btn btn-blue">Withdraw</Link>
      </div>

      <div className="row">
        <div className="col">
          <span>
            <p>Equity</p>
          </span>

          <div className="table">
            <div className="data">
              <p>Available margin</p>
              <p className="imp colored">{formatCurrency(availableMargin)}</p>
            </div>
            <div className="data">
              <p>Used margin</p>
              <p className="imp">{formatCurrency(totalInvestment)}</p>
            </div>
            <div className="data">
              <p>Available cash</p>
              <p className="imp">{formatCurrency(openingBalance)}</p>
            </div>
            <hr />
            <div className="data">
              <p>Opening Balance</p>
              <p>{formatCurrency(openingBalance)}</p>
            </div>
            <div className="data">
              <p>Payin</p>
              <p>0.00</p>
            </div>
            <div className="data">
              <p>SPAN</p>
              <p>0.00</p>
            </div>
            <div className="data">
              <p>Delivery margin</p>
              <p>0.00</p>
            </div>
            <div className="data">
              <p>Exposure</p>
              <p>0.00</p>
            </div>
            <div className="data">
              <p>Options premium</p>
              <p>0.00</p>
            </div>
            <hr />
            <div className="data">
              <p>Collateral (Liquid funds)</p>
              <p>0.00</p>
            </div>
            <div className="data">
              <p>Collateral (Equity)</p>
              <p>0.00</p>
            </div>
            <div className="data">
              <p>Total Collateral</p>
              <p>0.00</p>
            </div>
          </div>
        </div>

        <div className="col">
          <div className="commodity">
            <p>You don't have a commodity account</p>
            <Link className="btn btn-blue">Open Account</Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Funds;
