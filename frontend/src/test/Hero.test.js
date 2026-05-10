import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import Hero from "../landing_page/home/Hero";

//Test Suit
describe("Hero Component", () => {
  test("renders hero imagee", () => {
    render(<Hero></Hero>);
    const heroImage = screen.getByAltText("Hero img");
    expect(heroImage).toBeInTheDocument();
    expect(heroImage).toHaveAttribute("src", "media/images/homeHero.png");
  });
});
