import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { createSelviaMcpServer } from "@/lib/mcp/server";

function isAuthorized(request: Request) {
  const configuredKey = process.env.MCP_API_KEY;
  if (!configuredKey) return false;
  const header = request.headers.get("authorization") ?? "";
  const [scheme, token] = header.split(" ");
  return scheme === "Bearer" && token === configuredKey;
}

async function handle(request: Request) {
  if (!isAuthorized(request)) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "content-type": "application/json" },
    });
  }

  // Stateless mode: a fresh server + transport per request, per the SDK's
  // guidance for serverless environments — no session persists between calls.
  const server = createSelviaMcpServer();
  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true,
  });
  await server.connect(transport);
  return transport.handleRequest(request);
}

export const POST = handle;
export const GET = handle;
export const DELETE = handle;
