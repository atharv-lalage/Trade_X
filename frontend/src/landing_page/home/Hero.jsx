import React from "react";
import { Link } from "react-router-dom";

function Hero() {
  return (
    <>
      <div className="container p-5 mb-4">
        <div className="row text-center">
          <img
            src="media/images/homeHero.png"
            alt="Hero img"
            className="mb-5"
          />
          <h1 className="mt-5">Invest in everything</h1>
          <p className="fs-4 mt-2 mb-3">
            Online platorm to invest in stocks, derivatives, mutual funds, ETFs,
            bonds, and more
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
    </>
  );
}

export default Hero;
