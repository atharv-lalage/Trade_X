import React from "react";

function Hero() {
  return (
    <div className="container border-bottom">
      <div className="row mt-5 text-center p-3">
        <h1 className="fs-3">TradeX Products</h1>
        <h3 className="fs-5 text-muted mt-3">
          Sleek, modern, and intuitive trading platforms
        </h3>
        <p className="text-muted mt-2 mb-5">
          Check out our{" "}
          <a href="" style={{ textDecoration: "none" }}>
            investment offerings
            <i className="fa fa-long-arrow-right" aria-hidden="true"></i>
          </a>
        </p>
      </div>
    </div>
  );
}

export default Hero;
