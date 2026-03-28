import { getSeverityBadgeClass, getSeverityColor, formatProcessingTime, capitalize } from "./utils";
import { describe, it, expect } from "vitest";

describe("Utility Functions", () => {
  describe("getSeverityBadgeClass", () => {
    it("should return the correct class for critical logic", () => {
      expect(getSeverityBadgeClass("critical")).toBe("badge-critical");
      expect(getSeverityBadgeClass("emergency")).toBe("badge-critical");
      expect(getSeverityBadgeClass("high")).toBe("badge-high");
      expect(getSeverityBadgeClass("medium")).toBe("badge-warning");
      expect(getSeverityBadgeClass("low")).toBe("badge-normal");
      expect(getSeverityBadgeClass("unknown")).toBe("badge-medium"); // default
    });
  });

  describe("getSeverityColor", () => {
    it("should return correct preset hex codes", () => {
      expect(getSeverityColor("critical")).toBe("#ef4444"); // red
      expect(getSeverityColor("high")).toBe("#f97316"); // orange
      expect(getSeverityColor("medium")).toBe("#f59e0b"); // amber
      expect(getSeverityColor("low")).toBe("#10b981"); // green
      expect(getSeverityColor("unknown")).toBe("#94a3b8"); // default grey
    });
  });

  describe("formatProcessingTime", () => {
    it("should stringify millisecond ranges to readable formats", () => {
      expect(formatProcessingTime(500)).toBe("500ms");
      expect(formatProcessingTime(1500)).toBe("1.5s");
    });
  });

  describe("capitalize", () => {
    it("should reliably capitalize words", () => {
      expect(capitalize("hello")).toBe("Hello");
      expect(capitalize("WORLD")).toBe("WORLD");
      expect(capitalize("")).toBe("");
      expect(capitalize("a")).toBe("A");
    });
  });
});
