"use client";

import { useMemo, useState } from "react";
import { Users } from "lucide-react";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardTopbar } from "@/components/dashboard/topbar";
import { PatientsStats } from "@/components/patients/patients-stats";
import { PatientsTable } from "@/components/patients/patients-table";
import { DateRangeFilterSelect } from "@/components/patients/date-range-filter";
import { useAppointments } from "@/lib/appointments-context";
import { isWithinDateRange, type DateRangeFilter } from "@/lib/date-range";

export default function PatientsPage() {
  const { appointments } = useAppointments();
  const [range, setRange] = useState<DateRangeFilter>("90");

  const filtered = useMemo(
    () => appointments.filter((a) => isWithinDateRange(a.appointmentDate, range)),
    [appointments, range]
  );

  return (
    <div className="flex h-screen w-full bg-muted/30">
      <DashboardSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardTopbar title="Patients" icon={Users} />
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto flex max-w-[1400px] flex-col gap-6 p-4 sm:p-6">
            <div className="flex items-center justify-end">
              <DateRangeFilterSelect value={range} onChange={setRange} />
            </div>
            <PatientsStats appointments={filtered} />
            <PatientsTable appointments={filtered} />
          </div>
        </main>
      </div>
    </div>
  );
}
