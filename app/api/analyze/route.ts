import { NextRequest, NextResponse } from "next/server";
import { geminiPro, geminiFlash, fileToGenerativePart } from "@/lib/gemini";
import {
  MEDISCAN_PROMPT,
  VOICEBRIDGE_PROMPT,
  DOCUNLOCK_PROMPT,
  NEWSFILTER_PROMPT,
  SAFETYNET_PROMPT,
} from "@/lib/prompts";
import { ModuleType } from "@/types";

const PROMPTS: Record<ModuleType, string> = {
  mediscan: MEDISCAN_PROMPT,
  voicebridge: VOICEBRIDGE_PROMPT,
  docunlock: DOCUNLOCK_PROMPT,
  newsfilter: NEWSFILTER_PROMPT,
  safetynet: SAFETYNET_PROMPT,
};

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const body = await request.json();
    const { module, text, fileData, mimeType } = body as {
      module: ModuleType;
      text?: string;
      fileData?: string; // base64 encoded
      mimeType?: string;
    };

    if (!module || !PROMPTS[module]) {
      return NextResponse.json({ success: false, error: "Invalid module specified" }, { status: 400 });
    }

    if (!text && !fileData) {
      return NextResponse.json({ success: false, error: "No input provided" }, { status: 400 });
    }

    const prompt = PROMPTS[module];
    const parts = [];

    if (fileData && mimeType) {
      parts.push(fileToGenerativePart(fileData, mimeType));
    }

    const model = fileData ? geminiPro : geminiFlash;

    const inputText = text
      ? `${prompt}\n\nINPUT TO ANALYZE:\n${text}`
      : `${prompt}\n\nAnalyze the provided file/image above and extract all relevant information.`;

    const contentParts: Array<{ text: string } | { inlineData: { data: string; mimeType: string } }> = [];
    if (fileData && mimeType) {
      contentParts.push({ inlineData: { data: fileData, mimeType } });
    }
    contentParts.push({ text: inputText });

    const result = await model.generateContent(contentParts);
    const responseText = result.response.text();

    let parsed;
    try {
      // Strip markdown code fences if present
      const cleaned = responseText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      parsed = JSON.parse(cleaned);
    } catch {
      return NextResponse.json(
        { success: false, error: "Failed to parse AI response as JSON", raw: responseText },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      module,
      result: parsed,
      processingTime: Date.now() - startTime,
    });
  } catch (error: unknown) {
    console.error("Analysis error:", error);
    const message = error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
