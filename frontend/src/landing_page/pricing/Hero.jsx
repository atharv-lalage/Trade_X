import React from "react";

function Hero() {
  return (
    <div className="container">
      <div className="row text-center mt-5 p-4 border-bottom">
        <h2 className="mb-3">Charges</h2>
        <h3 className="fs-4 text-muted mb-5">List of all charges and taxes</h3>
      </div>
      <div className="row p-5 mt-5 border-bottom">
        <div className="col-4 p-5 text-center">
          <img src="media/images/pricingEquity.svg" alt="Equity" />
          <h1 className="fs-3">Free equity delivery</h1>
          <p>
            All equity delivery investments (NSE, BSE), are absolutely free — ₹
            0 brokerage.
          </p>
        </div>
        <div className="col-4 p-5 text-center">
          <img src="media/images/intradayTrades.svg" alt="Intraday" />
          <h1 className="fs-3">Intraday and F&amp;O trades</h1>
          <p>
            Flat ₹ 20 or 0.03% (whichever is lower) per executed order on
            intraday trades across equity, currency, and commodity trades. Flat
            ₹20 on all option trades.
          </p>
        </div>
        <div className="col-4 p-5 text-center">
          <img src="media/images/pricingEquity.svg" alt="MF" />
          <h1 className="fs-3">Free direct MF</h1>
          <p>
            All direct mutual fund investments are absolutely free — ₹ 0
            commissions &amp; DP charges.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Hero;
