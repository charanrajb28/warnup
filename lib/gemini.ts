import { GoogleGenerativeAI, Part } from "@google/generative-ai";

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is not set in environment variables");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export const geminiPro = genAI.getGenerativeModel({
  model: "gemini-1.5-pro",
  generationConfig: {
    responseMimeType: "application/json",
  },
});

export const geminiFlash = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  generationConfig: {
    responseMimeType: "application/json",
  },
});

export const geminiFlashText = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
});

export async function analyzeWithGemini(
  prompt: string,
  parts: Part[] = []
): Promise<string> {
  const model = parts.length > 0 ? geminiPro : geminiFlash;
  const result = await model.generateContent([prompt, ...parts]);
  return result.response.text();
}

export function fileToGenerativePart(
  data: string,
  mimeType: string
): Part {
  return {
    inlineData: {
      data,
      mimeType,
    },
  };
}

export { genAI };
