import type { SupabaseClient } from "@supabase/supabase-js";
import type Anthropic from "@anthropic-ai/sdk";
import { appointmentFromRow, supplyFromRow, type AppointmentRow, type SupplyRow } from "@/lib/supabase/mappers";

export const AI_DATA_TOOLS: Anthropic.Tool[] = [
  {
    name: "get_appointments",
    description:
      "Look up patient appointments, optionally filtered by status and/or date range. Returns patient name, treatment, doctor, date, price, and net revenue for each match.",
    input_schema: {
      type: "object",
      properties: {
        status: {
          type: "string",
          enum: ["Scheduled", "Completed", "Returned"],
          description: "Filter by appointment status.",
        },
        start_date: { type: "string", description: "ISO date (YYYY-MM-DD), inclusive lower bound on appointment_date." },
        end_date: { type: "string", description: "ISO date (YYYY-MM-DD), inclusive upper bound on appointment_date." },
        limit: { type: "number", description: "Max rows to return (default 25, max 100)." },
      },
    },
  },
  {
    name: "search_supplies",
    description: "Search the Insumos (medical supplies) catalog by name or unit.",
    input_schema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Search text matched against the supply's name and unit." },
        limit: { type: "number", description: "Max rows to return (default 25, max 100)." },
      },
      required: ["query"],
    },
  },
  {
    name: "get_revenue_summary",
    description:
      "Aggregate net revenue, price billed, incoming (pending) revenue, and appointment counts by status over an optional date range. Use this for questions about revenue, income, pending/incoming revenue, or how many patients/appointments happened.",
    input_schema: {
      type: "object",
      properties: {
        start_date: { type: "string", description: "ISO date (YYYY-MM-DD), inclusive lower bound." },
        end_date: { type: "string", description: "ISO date (YYYY-MM-DD), inclusive upper bound." },
      },
    },
  },
];

type ToolContext = { supabase: SupabaseClient };

export async function executeAiDataTool(
  name: string,
  input: Record<string, unknown>,
  { supabase }: ToolContext
): Promise<unknown> {
  const limit = Math.min(Number(input.limit) || 25, 100);

  if (name === "get_appointments") {
    let q = supabase.from("appointments").select("*").order("appointment_date", { ascending: false }).limit(limit);
    if (typeof input.status === "string") q = q.eq("status", input.status);
    if (typeof input.start_date === "string") q = q.gte("appointment_date", input.start_date);
    if (typeof input.end_date === "string") q = q.lte("appointment_date", input.end_date);
    const { data, error } = await q;
    if (error) throw new Error(error.message);
    return (data as AppointmentRow[]).map(appointmentFromRow).map((a) => ({
      patient: `${a.firstName} ${a.lastName}`,
      date: a.appointmentDate,
      treatment: a.treatment,
      doctor: a.doctor,
      status: a.status,
      price: a.price,
      reservation: a.reservation,
      netRevenue: a.netRevenue,
    }));
  }

  if (name === "search_supplies") {
    const query = String(input.query ?? "")
      .replace(/[,()%]/g, "")
      .trim();
    if (!query) return [];
    const { data, error } = await supabase
      .from("supplies")
      .select("*")
      .or(`name.ilike.%${query}%,unit.ilike.%${query}%`)
      .limit(limit);
    if (error) throw new Error(error.message);
    return (data as SupplyRow[]).map(supplyFromRow);
  }

  if (name === "get_revenue_summary") {
    let q = supabase.from("appointments").select("status,net_revenue,price,reservation,appointment_date");
    if (typeof input.start_date === "string") q = q.gte("appointment_date", input.start_date);
    if (typeof input.end_date === "string") q = q.lte("appointment_date", input.end_date);
    const { data, error } = await q;
    if (error) throw new Error(error.message);
    const rows = (data ?? []) as { status: string; net_revenue: number; price: number; reservation: number }[];
    const completed = rows.filter((r) => r.status === "Completed");
    const totalNetRevenue = completed.reduce((sum, r) => sum + Number(r.net_revenue), 0);
    const totalPriceBilled = completed.reduce((sum, r) => sum + Number(r.price), 0);
    // Incoming revenue = total billed price of appointments that haven't
    // happened yet. A Completed or Returned appointment is no longer
    // "incoming", so it drops out of this figure entirely.
    const incomingRevenue = rows
      .filter((r) => r.status === "Scheduled")
      .reduce((sum, r) => sum + Number(r.price), 0);
    return {
      totalAppointments: rows.length,
      completedAppointments: completed.length,
      scheduledAppointments: rows.filter((r) => r.status === "Scheduled").length,
      returnedAppointments: rows.filter((r) => r.status === "Returned").length,
      totalNetRevenue,
      totalPriceBilled,
      incomingRevenue,
      averageNetRevenue: completed.length > 0 ? Math.round(totalNetRevenue / completed.length) : 0,
    };
  }

  throw new Error(`Unknown tool: ${name}`);
}
