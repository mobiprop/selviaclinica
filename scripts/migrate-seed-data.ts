// One-off migration: loads the bundled seed data into Supabase.
//
// Usage (after running supabase/migrations/0001_init.sql against your project):
//   node --env-file=.env.local scripts/migrate-seed-data.ts
//
// Safe to re-run — every row upserts on its primary key.
//
// The seed data (src/data/seed-appointments.ts, seed-supplies.ts) uses
// short human-assigned string ids ("11", "s001", ...), but the appointments
// and supplies tables define `id` as `uuid`. We derive a stable UUID from
// each seed id via SHA-256 so re-running this script always upserts the
// same rows instead of inserting duplicates with fresh random uuids.

import { createHash } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { SEED_APPOINTMENTS } from "../src/data/seed-appointments.ts";
import { SEED_SUPPLIES } from "../src/data/seed-supplies.ts";
import { appointmentToRow, supplyToRow } from "../src/lib/supabase/mappers.ts";

const DEFAULT_MONTHLY_TARGET = 2000000;

function stableUuid(seed: string): string {
  const hex = createHash("sha256").update(seed).digest("hex").slice(0, 32).split("");
  hex[12] = "5"; // mark as a (non-standard) version 5-ish uuid
  hex[16] = ((parseInt(hex[16], 16) & 0x3) | 0x8).toString(16); // RFC 4122 variant bits
  const joined = hex.join("");
  return `${joined.slice(0, 8)}-${joined.slice(8, 12)}-${joined.slice(12, 16)}-${joined.slice(16, 20)}-${joined.slice(20, 32)}`;
}

function chunk<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) chunks.push(items.slice(i, i + size));
  return chunks;
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (run with --env-file=.env.local).");
    process.exit(1);
  }

  const supabase = createClient(url, serviceRoleKey, { auth: { persistSession: false } });

  console.log(`Upserting ${SEED_APPOINTMENTS.length} appointments...`);
  const appointmentRows = SEED_APPOINTMENTS.map((appointment) => ({
    ...appointmentToRow(appointment),
    id: stableUuid(`appointment:${appointment.id}`),
  }));
  for (const batch of chunk(appointmentRows, 200)) {
    const { error } = await supabase.from("appointments").upsert(batch);
    if (error) throw new Error(`appointments upsert failed: ${error.message}`);
  }

  console.log(`Upserting ${SEED_SUPPLIES.length} supplies...`);
  const supplyRows = SEED_SUPPLIES.map((supply) => ({
    ...supplyToRow(supply),
    id: stableUuid(`supply:${supply.id}`),
  }));
  for (const batch of chunk(supplyRows, 200)) {
    const { error } = await supabase.from("supplies").upsert(batch);
    if (error) throw new Error(`supplies upsert failed: ${error.message}`);
  }

  console.log("Seeding default monthly target...");
  const { error: settingsError } = await supabase
    .from("app_settings")
    .upsert({ key: "monthly_target", value: DEFAULT_MONTHLY_TARGET, updated_at: new Date().toISOString() });
  if (settingsError) throw new Error(`app_settings upsert failed: ${settingsError.message}`);

  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
