import { GoogleGenerativeAI, Part } from "@google/generative-ai";

// Lazy initialisation — only instantiated at request time (server-side),
// never during the Next.js build phase.
function getClient() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error(
      "GEMINI_API_KEY is not set. Add it as an environment variable in Cloud Run."
    );
  }
  return new GoogleGenerativeAI(key);
}

export function getProModel() {
  return getClient().getGenerativeModel({
    model: "gemini-2.5-pro",
    generationConfig: { responseMimeType: "application/json" },
  });
}

export function getFlashModel() {
  return getClient().getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: { responseMimeType: "application/json" },
  });
}

export function fileToGenerativePart(data: string, mimeType: string): Part {
  return { inlineData: { data, mimeType } };
}
