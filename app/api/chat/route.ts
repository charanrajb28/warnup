// @ts-nocheck
import { streamText, CoreMessage } from "ai";
import { google } from "@ai-sdk/google";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { messages, contextData, moduleName } = (await req.json()) as {
      messages: CoreMessage[];
      contextData: any;
      moduleName: string;
    };

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is missing from environment variables." },
        { status: 500 }
      );
    }

    // System prompt grounding the model in the specific analysis result
    const systemPrompt = `You are ClearPath AI, a specialized assistant operating within the ${moduleName} module.
The user has just run an analysis on some real-world data, and here is the exact structured output generated from that analysis:

<ANALYSIS_CONTEXT>
${JSON.stringify(contextData, null, 2)}
</ANALYSIS_CONTEXT>

Your job is to answer the user's follow-up questions *based strictly on this context*. 
Do not hallucinate. If the answer is not in the context, tell them you don't have that information.
Keep your answers professional, concise, and highly actionable. Prioritize bullet points.
`;

    const result = streamText({
      model: google("gemini-2.5-flash"),
      messages,
      system: systemPrompt,
      temperature: 0.2, // low temperature for highly grounded deterministic responses
    });

    return result.toTextStreamResponse();
  } catch (err: unknown) {
    console.error(`[Chat Route Error]`, err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to initiate chat stream" },
      { status: 500 }
    );
  }
}
