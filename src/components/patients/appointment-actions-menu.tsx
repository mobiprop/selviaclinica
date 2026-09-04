"use client";

import { MoreHorizontal, Pencil } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

export function AppointmentActionsMenu({ onEdit }: { onEdit: () => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground">
        <MoreHorizontal className="h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onEdit}>
          <Pencil className="h-3.5 w-3.5" />
          Edit
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
