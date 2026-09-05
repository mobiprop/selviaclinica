"use client";

import { useState } from "react";
import { FolderOpen, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { formatDate } from "@/lib/format";
import { openDrivePicker } from "@/lib/integrations/drive-picker";
import type { IntegrationConnection } from "@/lib/integrations-context";

export function ManageConnectionDialog({
  open,
  onOpenChange,
  name,
  connection,
  onDisconnect,
  showDrivePicker = false,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  name: string;
  connection: IntegrationConnection;
  onDisconnect: () => void;
  showDrivePicker?: boolean;
}) {
  const [picking, setPicking] = useState(false);
  const [pickerMessage, setPickerMessage] = useState<string | null>(null);

  async function handleSelectFiles() {
    setPicking(true);
    setPickerMessage(null);
    try {
      const picked = await openDrivePicker();
      if (picked && picked.length > 0) {
        setPickerMessage(`Shared ${picked.length} file${picked.length === 1 ? "" : "s"} — search can find ${picked.length === 1 ? "it" : "them"} now.`);
      }
    } catch (err) {
      setPickerMessage(err instanceof Error ? err.message : "Failed to open Google Picker");
    } finally {
      setPicking(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{name}</DialogTitle>
          <DialogDescription>This integration is connected.</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-1.5 rounded-md border border-border bg-muted/40 p-3 text-sm">
          {connection.accountLabel && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Account</span>
              <span className="font-medium text-foreground">{connection.accountLabel}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted-foreground">Connected</span>
            <span className="font-medium text-foreground">{formatDate(connection.connectedAt.slice(0, 10))}</span>
          </div>
        </div>

        {showDrivePicker && (
          <div className="flex flex-col gap-2">
            <p className="text-xs text-muted-foreground">
              For privacy, Drive search only works on files you explicitly share with Selvia.
            </p>
            <Button type="button" variant="outline" className="w-full" disabled={picking} onClick={handleSelectFiles}>
              {picking ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FolderOpen className="h-3.5 w-3.5" />}
              Select files to share
            </Button>
            {pickerMessage && <p className="text-xs text-muted-foreground">{pickerMessage}</p>}
          </div>
        )}

        <DialogFooter>
          <DialogClose render={<Button type="button" variant="outline" />}>Close</DialogClose>
          <Button
            type="button"
            variant="outline"
            className="text-red-600 hover:bg-red-50 hover:text-red-700"
            onClick={() => {
              onDisconnect();
              onOpenChange(false);
            }}
          >
            Disconnect
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
