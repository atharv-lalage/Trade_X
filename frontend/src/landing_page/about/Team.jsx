import React from "react";

function Team() {
  return (
    <div className="container p-5">
      <div className="row">
        <h1 className="text-center fs-3" style={{ fontWeight: "500" }}>
          People
        </h1>
      </div>

      <div className="row p-5  ">
        <div className="col-6 p-5 text-center fs-6">
          <img
            src="media/images/ironMan.png"
            alt="Iron Man"
            style={{ borderRadius: "100%", width: "40%" }}
          />
          <h4 className="mt-6">Iron Man</h4>
          <h6>Founder, CEO</h6>
        </div>

        <div className="col-6 mt-5">
          <p className="fs-6">
            Nithin bootstrapped and founded TradeX in 2010 to overcome the
            hurdles he faced during his decade long stint as a trader. Today,
            TradeX has changed the landscape of the Indian broking industry.
            <br />
            <br /> He is a member of the SEBI Secondary Market Advisory
            Committee (SMAC) and the Market Data Advisory Committee (MDAC).
            <br />
            <br /> Playing basketball is his zen.
            <br />
            <br /> Connect on{" "}
            <a href="" style={{ textDecoration: "none" }}>
              Homepage
            </a>{" "}
            /{" "}
            <a href="" style={{ textDecoration: "none" }}>
              TradingQnA
            </a>{" "}
            /{" "}
            <a href="" style={{ textDecoration: "none" }}>
              {" "}
              Twitter
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Team;
