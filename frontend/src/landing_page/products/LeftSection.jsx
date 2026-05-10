import React from "react";

function LeftSection({
  imageURL,
  productName,
  productDescription,
  tryDemo,
  learnMore,
  googlePlay,
  appStore,
}) {
  return (
    <div className="container ">
      <div className="row">
        <div className="col-1"></div>
        <div className="col-5 p-5">
          <img src={imageURL} alt={productName} style={{ width: "100%" }} />
        </div>
        <div className="col-6 mt-5 p-5">
          <h1>{productName}</h1>
          <p>{productDescription}</p>
          <div>
            <a href={tryDemo} style={{ textDecoration: "none" }}>
              Try Demo{" "}
              <i className="fa fa-arrow-right" aria-hidden="true"></i>
            </a>
            <a
              href={learnMore}
              style={{ textDecoration: "none", marginLeft: "50px" }}
            >
              Learn More{" "}
              <i className="fa fa-arrow-right" aria-hidden="true"></i>
            </a>
          </div>
          <br />
          <div>
            <a href={googlePlay}>
              <img src="media/images/googlePlayBadge.svg" alt="Google Play" />
            </a>
            <a href={appStore} style={{ marginLeft: "25px" }}>
              <img src="media/images/appstoreBadge.svg" alt="App Store" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LeftSection;
