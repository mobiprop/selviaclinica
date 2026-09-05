import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { SEED_APPOINTMENTS } from "@/data/seed-appointments";
import { SEED_SUPPLIES } from "@/data/seed-supplies";

/**
 * Builds a fresh MCP server per request (stateless mode — see /api/mcp/route.ts).
 *
 * Data note: this reads the same seed data bundled into the app, not whatever
 * a browser session has added/edited in memory — there's no shared backend
 * yet (appointments/supplies live in client-side React state until the
 * planned Supabase migration), so this reflects the clinic's data as of the
 * last import, not live edits made in an open dashboard tab.
 */
export function createSelviaMcpServer() {
  const server = new McpServer({ name: "selvia-clinica", version: "1.0.0" });

  server.registerTool(
    "list_upcoming_appointments",
    {
      title: "List upcoming appointments",
      description: "Lists scheduled (not yet completed) patient appointments, soonest first.",
      inputSchema: { limit: z.number().int().min(1).max(50).default(10) },
    },
    async ({ limit }) => {
      const upcoming = SEED_APPOINTMENTS
        .filter((a) => a.status === "Scheduled")
        .sort((a, b) => a.appointmentDate.localeCompare(b.appointmentDate))
        .slice(0, limit)
        .map((a) => ({
          patient: `${a.firstName} ${a.lastName}`,
          date: a.appointmentDate,
          treatment: a.treatment,
          doctor: a.doctor,
          price: a.price,
        }));
      return { content: [{ type: "text", text: JSON.stringify(upcoming, null, 2) }] };
    }
  );

  server.registerTool(
    "search_supplies",
    {
      title: "Search medical supplies",
      description: "Searches the Insumos catalog by name or unit.",
      inputSchema: { query: z.string().min(1), limit: z.number().int().min(1).max(50).default(10) },
    },
    async ({ query, limit }) => {
      const q = query.toLowerCase();
      const matches = SEED_SUPPLIES
        .filter((s) => `${s.name} ${s.unit}`.toLowerCase().includes(q))
        .slice(0, limit)
        .map((s) => ({ name: s.name, unit: s.unit, usage: s.usage, currency: s.currency }));
      return { content: [{ type: "text", text: JSON.stringify(matches, null, 2) }] };
    }
  );

  server.registerTool(
    "get_revenue_summary",
    {
      title: "Get revenue summary",
      description: "Aggregate net revenue and patient counts across every completed appointment on record.",
      inputSchema: {},
    },
    async () => {
      const completed = SEED_APPOINTMENTS.filter((a) => a.status === "Completed");
      const totalNetRevenue = completed.reduce((sum, a) => sum + a.netRevenue, 0);
      const summary = {
        completedAppointments: completed.length,
        totalNetRevenue,
        averageNetRevenue: completed.length > 0 ? Math.round(totalNetRevenue / completed.length) : 0,
      };
      return { content: [{ type: "text", text: JSON.stringify(summary, null, 2) }] };
    }
  );

  return server;
}
