import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import React from "react";
import LiveFeed from "./LiveFeed";

// Mock the Firebase module completely
vi.mock("@/lib/firebase", () => ({
  db: {} // dummy db object so the component tries to render
}));

// Mock the realtime firestore functions
vi.mock("firebase/firestore", () => {
  return {
    collection: vi.fn(),
    query: vi.fn(),
    orderBy: vi.fn(),
    limit: vi.fn(),
    onSnapshot: vi.fn((query, callback) => {
      // Simulate real-time data arriving
      callback({
        docs: [
          { id: "1", data: () => ({ module: "mediscan", action: "analyze_started" }) },
          { id: "2", data: () => ({ module: "safetynet", action: "alert_published" }) }
        ]
      });
      return vi.fn(); // return mock unsubscribe
    })
  };
});

describe("LiveFeed Component", () => {
  it("renders live events when snapshot updates", () => {
    render(<LiveFeed />);
    
    // Check if the title is displayed
    expect(screen.getByText(/Global Live Feed/i)).toBeTruthy();
    
    // Check if the mock events are injected into the DOM
    expect(screen.getByText(/MEDISCAN:/i)).toBeTruthy();
    expect(screen.getByText(/analyze_started/i)).toBeTruthy();
    
    expect(screen.getByText(/SAFETYNET:/i)).toBeTruthy();
    expect(screen.getByText(/alert_published/i)).toBeTruthy();
  });
});
