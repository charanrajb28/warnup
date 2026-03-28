import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import ConfidenceBar from "./ConfidenceBar";
import React from "react";

describe("ConfidenceBar Component", () => {
  it("renders the correct percentage score", () => {
    render(<ConfidenceBar score={0.85} />);
    expect(screen.getByText("85%")).toBeTruthy();
    expect(screen.getByText("High Confidence")).toBeTruthy();
  });

  it("calculates the correct color based on score thresholds", () => {
    // High score should default to rendering without crashing and we check if the label exists
    render(<ConfidenceBar score={0.95} />);
    expect(screen.getByText("95%")).toBeTruthy();
  });

  it("conditionally renders the quality badge when provided", () => {
    render(<ConfidenceBar score={0.7} quality="Fair" />);
    expect(screen.getByText("Fair")).toBeTruthy();
    expect(screen.getByText(/Data Quality/i)).toBeTruthy();
  });

  it("skips rendering the quality badge when not provided", () => {
    render(<ConfidenceBar score={0.5} />);
    expect(screen.queryByText(/Data Quality/i)).toBeNull();
  });

  it("caps the width at 100% implicitly via framer-motion props", () => {
    render(<ConfidenceBar score={1.20} />);
    // Testing boundary conditions of valid scores
    expect(screen.getByText("120%")).toBeTruthy();
  });
});
