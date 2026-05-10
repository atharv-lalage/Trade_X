import React from "react";

function Universe() {
  return (
    <div className="container p-5 mb-4">
      <div className="row text-center">
        <h1 className="mt-5 fs-3">The TradeX Universe</h1>
        <p className="fs-5 mt-2 mb-3">
          Extend your trading and investment experience even further with our
          partner platforms
        </p>
      </div>
      <div className="row text-center mt-3">
        <div className="col-4 p-3">
          <img
            src="media/images/smallcaselogo.png"
            alt="Smallcase logo"
            style={{ maxWidth: "150px", height: "auto" }}
          />
          <p className="text-small text-muted mt-3">
            Thematic investing platform
          </p>
        </div>
        <div className="col-4 p-3">
          <img
            src="media/images/streakLogo.png"
            alt="Streak logo"
            style={{ maxWidth: "150px", height: "auto" }}
          />
          <p className="text-small text-muted mt-3">Algo &amp; strategy platform</p>
        </div>
        <div className="col-4 p-3">
          <img
            src="media/images/sensibullLogo.svg"
            alt="Sensibull logo"
            style={{ maxWidth: "150px", height: "auto" }}
          />
          <p className="text-small text-muted mt-3">Option trading platform</p>
        </div>
      </div>
      <div className="row text-center mt-4">
        <div className="col-4 p-3">
          <img
            src="media/images/zerodhaFundhouse.png"
            alt="Fundhouse"
            style={{ maxWidth: "150px", height: "auto" }}
          />
          <p className="text-small text-muted mt-3">Asset management</p>
        </div>
        <div className="col-4 p-3">
          <img
            src="media/images/goldenpiLogo.png"
            alt="GoldenPi"
            style={{ maxWidth: "150px", height: "auto" }}
          />
          <p className="text-small text-muted mt-3">Bonds trading platform</p>
        </div>
        <div className="col-4 p-3">
          <img
            src="media/images/dittologo.png"
            alt="Ditto"
            style={{ maxWidth: "150px", height: "auto" }}
          />
          <p className="text-small text-muted mt-3">Insurance</p>
        </div>
      </div>
      <div className="row text-center">
        <button
          className="p-2 btn btn-primary fs-5 mb-5 mt-4"
          style={{ width: "20%", margin: "0 auto" }}
        >
          Sign up for free
        </button>
      </div>
    </div>
  );
}

export default Universe;
