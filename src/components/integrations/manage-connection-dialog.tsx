"use client";

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
import type { IntegrationConnection } from "@/lib/integrations-context";

export function ManageConnectionDialog({
  open,
  onOpenChange,
  name,
  connection,
  onDisconnect,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  name: string;
  connection: IntegrationConnection;
  onDisconnect: () => void;
}) {
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
