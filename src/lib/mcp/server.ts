import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { appointmentFromRow, supplyFromRow, type AppointmentRow, type SupplyRow } from "@/lib/supabase/mappers";
import { searchDriveFiles, readDriveFile } from "@/lib/integrations/google-drive";
import { SEED_APPOINTMENTS } from "@/data/seed-appointments";
import { SEED_SUPPLIES } from "@/data/seed-supplies";

/**
 * Builds a fresh MCP server per request (stateless mode — see /api/mcp/route.ts).
 *
 * Reads live data straight from Supabase using the service-role client (this
 * runs only inside the already Bearer-key-authenticated /api/mcp route, never
 * in the browser). Falls back to the bundled seed data if Supabase isn't
 * configured yet, so the tools still work before the production migration
 * finishes.
 */
export function createSelviaMcpServer() {
  const server = new McpServer({ name: "selvia-clinica", version: "1.0.0" });

  async function loadAppointments() {
    const configured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
    if (!configured) return SEED_APPOINTMENTS;
    try {
      const supabase = createServiceRoleClient();
      const { data, error } = await supabase.from("appointments").select("*");
      if (error || !data) return SEED_APPOINTMENTS;
      return (data as AppointmentRow[]).map(appointmentFromRow);
    } catch {
      return SEED_APPOINTMENTS;
    }
  }

  async function loadSupplies() {
    const configured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
    if (!configured) return SEED_SUPPLIES;
    try {
      const supabase = createServiceRoleClient();
      const { data, error } = await supabase.from("supplies").select("*");
      if (error || !data) return SEED_SUPPLIES;
      return (data as SupplyRow[]).map(supplyFromRow);
    } catch {
      return SEED_SUPPLIES;
    }
  }

  server.registerTool(
    "list_upcoming_appointments",
    {
      title: "List upcoming appointments",
      description: "Lists scheduled (not yet completed) patient appointments, soonest first.",
      inputSchema: { limit: z.number().int().min(1).max(50).default(10) },
    },
    async ({ limit }) => {
      const appointments = await loadAppointments();
      const upcoming = appointments
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
      const supplies = await loadSupplies();
      const q = query.toLowerCase();
      const matches = supplies
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
      const appointments = await loadAppointments();
      const completed = appointments.filter((a) => a.status === "Completed");
      const totalNetRevenue = completed.reduce((sum, a) => sum + a.netRevenue, 0);
      const summary = {
        completedAppointments: completed.length,
        totalNetRevenue,
        averageNetRevenue: completed.length > 0 ? Math.round(totalNetRevenue / completed.length) : 0,
      };
      return { content: [{ type: "text", text: JSON.stringify(summary, null, 2) }] };
    }
  );

  server.registerTool(
    "search_drive_files",
    {
      title: "Search Google Drive",
      description:
        "Full-text search over the clinic's connected Google Drive (file names and content). Requires Google Drive to be connected from the Integrations page.",
      inputSchema: { query: z.string().min(1), limit: z.number().int().min(1).max(25).default(10) },
    },
    async ({ query, limit }) => {
      try {
        const files = await searchDriveFiles(query, limit);
        return { content: [{ type: "text", text: JSON.stringify(files, null, 2) }] };
      } catch (err) {
        const message = err instanceof Error ? err.message : "Google Drive search failed";
        return { content: [{ type: "text", text: message }], isError: true };
      }
    }
  );

  server.registerTool(
    "read_drive_file",
    {
      title: "Read a Google Drive file",
      description:
        "Reads a Google Drive file's content by its file ID (from search_drive_files). Google Sheets export as CSV (first sheet only), Google Docs as plain text, other file types are read directly. Requires Google Drive to be connected.",
      inputSchema: { fileId: z.string().min(1) },
    },
    async ({ fileId }) => {
      try {
        const file = await readDriveFile(fileId);
        return {
          content: [{ type: "text", text: `# ${file.name} (${file.mimeType})\n\n${file.content}` }],
        };
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to read Drive file";
        return { content: [{ type: "text", text: message }], isError: true };
      }
    }
  );

  return server;
}
