import React from "react";
import { Link } from "react-router-dom";

function OpenAccount() {
  return (
    <div className="container p-5 mb-4">
      <div className="row text-center">
        <h1 className="mt-5">Open a TradeX account</h1>
        <p className="fs-4 mt-2 mb-3">
          Modern platforms and apps, ₹0 investments, and flat ₹20 intraday and
          F&amp;O trades.
        </p>
        <Link
          className="p-2 btn btn-primary fs-5 mb-5 mt-4"
          style={{ width: "20%", margin: "0 auto", textDecoration: "none" }}
          to="/signup"
        >
          Sign up for free
        </Link>
      </div>
    </div>
  );
}

export default OpenAccount;
