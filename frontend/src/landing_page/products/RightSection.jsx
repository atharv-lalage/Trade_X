import React from "react";

function RightSection({
  imageURL,
  productName,
  productDescription,
  learnMore,
}) {
  return (
    <div className="container mt-5">
      <div className="row">
        <div className="col-6 mt-5 p-5">
          <h1 className="mt-5">{productName}</h1>
          <p>{productDescription}</p>
          <a href={learnMore} style={{ textDecoration: "none" }}>
            Learn More{" "}
            <i className="fa fa-arrow-right" aria-hidden="true"></i>
          </a>
        </div>

        <div className="col-5 p-5">
          <img src={imageURL} alt={productName} style={{ width: "100%" }} />
        </div>

        <div className="col-1"></div>
      </div>
    </div>
  );
}

export default RightSection;
