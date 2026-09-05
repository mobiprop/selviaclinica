import Anthropic from "@anthropic-ai/sdk";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { AI_DATA_TOOLS, executeAiDataTool } from "@/lib/ai-data/tools";

const MODEL = "claude-sonnet-5";
const MAX_TOOL_ROUNDS = 5;

const SYSTEM_PROMPT = `You are the AI Data assistant built into Selvia Clínica's internal staff dashboard.
You help clinic staff understand their own data — patients, appointments, revenue, and medical supplies (Insumos).

You have tools to query the clinic's real, live database. Use them whenever a question depends on actual data
(counts, totals, specific patients or supplies, date ranges) rather than guessing or answering from general knowledge.
When you report figures, state them plainly (e.g. currency in Argentine pesos unless a tool result says otherwise).
If a tool returns no results, say so plainly rather than inventing data.
Keep answers concise and to the point — this is a working dashboard, not a long-form chat.`;

export async function GET() {
  return Response.json({ configured: Boolean(process.env.ANTHROPIC_API_KEY) });
}

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: "unauthorized", message: "Not signed in" }, { status: 401 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "not_configured" }, { status: 400 });
  }

  let messages: { role: "user" | "assistant"; content: string }[];
  try {
    ({ messages } = await request.json());
  } catch {
    return Response.json({ error: "bad_request", message: "Malformed request body" }, { status: 400 });
  }
  if (!Array.isArray(messages) || messages.length === 0) {
    return Response.json({ error: "bad_request", message: "messages is required" }, { status: 400 });
  }

  const anthropic = new Anthropic({ apiKey });
  let conversation: Anthropic.MessageParam[] = messages.map((m) => ({ role: m.role, content: m.content }));

  async function callModel() {
    try {
      return await anthropic.messages.create({
        model: MODEL,
        // Sonnet 5 defaults to adaptive thinking at "high" effort, and
        // thinking tokens are drawn from the same max_tokens budget as the
        // final answer — at the default effort, 1024 was nowhere near
        // enough headroom and responses were getting cut off before ever
        // producing an answer. "low" effort is Anthropic's own recommended
        // setting for chat/non-coding use cases like this one.
        max_tokens: 4096,
        output_config: { effort: "low" },
        system: SYSTEM_PROMPT,
        tools: AI_DATA_TOOLS,
        messages: conversation,
      });
    } catch (err) {
      // Surface the real Anthropic error (invalid key, bad model id, rate
      // limit, etc.) instead of a generic 500 with no diagnostic info.
      const message =
        err instanceof Anthropic.APIError ? `${err.status ?? ""} ${err.message}`.trim() : String(err);
      console.error("Anthropic API call failed:", message);
      throw new Error(message);
    }
  }

  let response: Anthropic.Message;
  try {
    response = await callModel();

    let round = 0;
    while (response.stop_reason === "tool_use" && round < MAX_TOOL_ROUNDS) {
      round++;
      const toolUseBlocks = response.content.filter(
        (block): block is Anthropic.ToolUseBlock => block.type === "tool_use"
      );

      const toolResults: Anthropic.ToolResultBlockParam[] = await Promise.all(
        toolUseBlocks.map(async (block) => {
          try {
            const result = await executeAiDataTool(block.name, block.input as Record<string, unknown>, {
              supabase,
            });
            return { type: "tool_result", tool_use_id: block.id, content: JSON.stringify(result) };
          } catch (err) {
            const message = err instanceof Error ? err.message : "Tool failed";
            console.error(`Tool ${block.name} failed:`, message);
            return { type: "tool_result", tool_use_id: block.id, content: message, is_error: true };
          }
        })
      );

      conversation = [
        ...conversation,
        { role: "assistant", content: response.content },
        { role: "user", content: toolResults },
      ];

      response = await callModel();
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "The AI assistant failed to respond";
    return Response.json({ error: "model_error", message }, { status: 502 });
  }

  const finalText = response.content
    .filter((block): block is Anthropic.TextBlock => block.type === "text")
    .map((block) => block.text)
    .join("\n")
    .trim();

  let text = finalText;
  if (!text) {
    if (response.stop_reason === "max_tokens") {
      console.error("AI Data response was truncated by max_tokens with no usable text.");
      text = "That question needed a longer answer than I had room for — try asking something more specific.";
    } else {
      text = "I couldn't come up with an answer for that.";
    }
  }

  // The tool-use round trips above are already fully resolved by this point,
  // so this streams the finished answer back in small chunks purely for a
  // Claude-like typing effect — not real token-level model streaming.
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const chunkSize = 5;
      for (let i = 0; i < text.length; i += chunkSize) {
        controller.enqueue(encoder.encode(text.slice(i, i + chunkSize)));
        await new Promise((resolve) => setTimeout(resolve, 10));
      }
      controller.close();
    },
  });

  return new Response(stream, { headers: { "content-type": "text/plain; charset=utf-8" } });
}
