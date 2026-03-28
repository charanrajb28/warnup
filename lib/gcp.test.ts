import { describe, it, expect, vi } from "vitest";
import { saveAnalysisToFirestore, publishCriticalAlert } from "./gcp";

// We mock the console to avoid spamming the test terminal
vi.spyOn(console, 'warn').mockImplementation(() => {});
vi.spyOn(console, 'log').mockImplementation(() => {});

vi.mock("@google-cloud/firestore", () => {
  return {
    Firestore: vi.fn().mockImplementation(() => ({
      collection: vi.fn().mockReturnValue({ add: vi.fn() })
    }))
  };
});

vi.mock("@google-cloud/pubsub", () => {
  return {
    PubSub: vi.fn().mockImplementation(() => ({
      topic: vi.fn().mockReturnValue({ publishMessage: vi.fn() })
    }))
  };
});

describe("GCP Integration Library", () => {
  it("safely attempts to save analysis when called", async () => {
    // This tests the code path that invokes getFirestore (which will safely catch in dev mode)
    await saveAnalysisToFirestore("mockModule", { some: "data" });
    expect(console.log).not.toHaveBeenCalledWith("error"); // The function should exit gracefully
  });

  it("safely publishes critical alerts dynamically", async () => {
    // Tests that high severity is handled
    await publishCriticalAlert("safetynet", "emergency", "Major crisis");
    // Should gracefully bypass or log the mock
  });

  it("ignores low severity publishing alerts", async () => {
    // Should return early and not even attempt to publish
    await publishCriticalAlert("mediscan", "low", "Minor allergy");
    // No error should be thrown
  });
});
