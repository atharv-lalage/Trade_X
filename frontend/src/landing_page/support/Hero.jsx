import React from "react";

function Hero() {
  return (
    <section className="container-fluid" id="supportHero">
      <div className="p-5 " id="supportWrapper">
        <h4>Support Portal</h4>
        <a href="">Track Tickets</a>
      </div>
      <div className="row p-3 m-3">
        <div className="col-6 p-5 ">
          <h1 className="fs-3">
            Search for an answer or browse help topics to create a ticket
          </h1>
          <input
            placeholder='Eg: How do i activate F&O, why is my order getting rejected..'
            className="mb-3"
          />
          <br />
          <div className="mb-2">
            <a href="" className="m-3 ">
              Track account opening
            </a>
            <a href="">Track segment activation</a>
          </div>
          <div className="">
            <a href="" className="m-3">
              Intraday margin
            </a>
            <a href="" className="mt-2">
              user manual
            </a>
          </div>
        </div>
        <div className="col-6 p-5 ">
          <h1 className="fs-3">Featured</h1>
          <ol>
            <li>
              <a href="">Current Takeovers and Delisting- January 2026</a>
            </li>
            <li>
              <a href="">Latest Intraday leverages- MIS &amp; CO</a>
            </li>
          </ol>
        </div>
      </div>
    </section>
  );
}

export default Hero;
