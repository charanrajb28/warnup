import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import ModuleLayout from "./ModuleLayout";
import { Activity } from "lucide-react";
import React from "react";

describe("ModuleLayout Component", () => {
  it("renders the navbar items and title correctly", () => {
    render(<ModuleLayout title="Mock Module" subtitle="MockSub" icon={Activity} color="#fff" gradient=""><div data-testid="child" /></ModuleLayout>);
    
    // Check navigation items are rendered
    expect(screen.getByText("Back")).toBeTruthy();
    expect(screen.getByText("Clear")).toBeTruthy();
    expect(screen.getByText("Mock Module")).toBeTruthy();
    expect(screen.getByText("MockSub")).toBeTruthy();
  });

  it("renders children natively inside main content", () => {
    render(
      <ModuleLayout title="Mock" subtitle="Mock" icon={Activity} color="#000" gradient="none">
        <div data-testid="test-child" />
      </ModuleLayout>
    );
    expect(screen.getByTestId("test-child")).toBeTruthy();
  });
});
