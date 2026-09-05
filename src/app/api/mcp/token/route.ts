export async function GET() {
  const apiKey = process.env.MCP_API_KEY;
  if (!apiKey) {
    return Response.json({ configured: false });
  }
  return Response.json({ configured: true, apiKey, endpoint: "/api/mcp" });
}
