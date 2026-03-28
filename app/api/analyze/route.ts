import { NextRequest, NextResponse } from "next/server";
import { getProModel, getFlashModel } from "@/lib/gemini";
import { z } from "zod";
import xss from "xss";
import { saveAnalysisToFirestore, publishCriticalAlert } from "@/lib/gcp";

// Force dynamic: prevents Next.js from statically evaluating this route at build time.
// The Gemini API key is only available at runtime (Cloud Run env vars), not during `npm run build`.
export const dynamic = "force-dynamic";
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
    const RequestSchema = z.object({
      module: z.enum(["mediscan", "voicebridge", "docunlock", "newsfilter", "safetynet"]),
      text: z.string().optional(),
      fileData: z.string().optional(),
      mimeType: z.string().optional(),
    });

    const parsedBody = RequestSchema.safeParse(await request.json());
    if (!parsedBody.success) {
      return NextResponse.json({ success: false, error: "Invalid payload format" }, { status: 400 });
    }

    const { module, text, fileData, mimeType } = parsedBody.data;

    // Sanitize any free-form text input to prevent XSS bleeding into AI prompts
    const sanitizedText = text ? xss(text) : undefined;

    if (!module || !PROMPTS[module]) {
      return NextResponse.json({ success: false, error: "Invalid module specified" }, { status: 400 });
    }

    if (!text && !fileData) {
      return NextResponse.json({ success: false, error: "No input provided" }, { status: 400 });
    }

    const prompt = PROMPTS[module];

    // Build content parts
    const contentParts: Array<{ text: string } | { inlineData: { data: string; mimeType: string } }> = [];
    if (fileData && mimeType) {
      contentParts.push({ inlineData: { data: fileData, mimeType } });
    }

    const inputText = sanitizedText
      ? `${prompt}\n\nINPUT TO ANALYZE:\n${sanitizedText}`
      : `${prompt}\n\nAnalyze the provided file/image above and extract all relevant information.`;

    contentParts.push({ text: inputText });

    // Use Pro for multimodal (file) inputs, Flash for text-only
    const model = fileData ? getProModel() : getFlashModel();

    const result = await model.generateContent(contentParts);
    const responseText = result.response.text();

    let parsed;
    try {
      const cleaned = responseText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      parsed = JSON.parse(cleaned);
    } catch {
      return NextResponse.json(
        { success: false, error: "Failed to parse AI response", raw: responseText },
        { status: 500 }
      );
    }

    // Fire-and-forget background tasks: Google Cloud Firestore + Pub/Sub
    const executionTime = Date.now() - startTime;
    Promise.all([
      saveAnalysisToFirestore(module, parsed),
      ...parsed.criticalFlags?.map((flag: any) =>
        publishCriticalAlert(module, flag.urgency, flag.flag)
      ) || []
    ]).catch(console.error);

    return NextResponse.json({
      success: true,
      module,
      result: parsed,
      processingTime: executionTime,
    });
  } catch (error: unknown) {
    console.error("Analysis error:", error);
    const message = error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
