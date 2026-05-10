import React from "react";
import Dashboard from "./Dashboard";
import TopBar from "./TopBar";

const Home = ({ username }) => {
  return (
    <>
      <TopBar />
      <Dashboard username={username} />
    </>
  );
};

export default Home;
