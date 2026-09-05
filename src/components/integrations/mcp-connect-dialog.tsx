"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
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

export function McpConnectDialog({
  open,
  onOpenChange,
  apiKey,
  endpointUrl,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  apiKey: string;
  endpointUrl: string;
}) {
  const [copied, setCopied] = useState(false);

  const configSnippet = JSON.stringify(
    {
      mcpServers: {
        "selvia-clinica": {
          url: endpointUrl,
          headers: { Authorization: `Bearer ${apiKey}` },
        },
      },
    },
    null,
    2
  );

  async function copyConfig() {
    try {
      await navigator.clipboard.writeText(configSnippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard API unavailable — the snippet is still visible to copy manually.
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>MCP Connection ready</DialogTitle>
          <DialogDescription>
            Paste this into any MCP-compatible client (Claude Desktop, Claude Code, etc.) to give it
            read access to your appointments, supplies, and revenue summary.
          </DialogDescription>
        </DialogHeader>

        <div className="relative">
          <pre className="max-h-64 overflow-auto rounded-md border border-border bg-muted p-3 text-xs text-foreground">
            {configSnippet}
          </pre>
          <button
            onClick={copyConfig}
            className="absolute right-2 top-2 flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1 text-xs text-muted-foreground hover:bg-accent"
          >
            {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>

        <p className="text-xs text-muted-foreground">
          This key reads the clinic&apos;s current data snapshot — it doesn&apos;t yet reflect edits made
          live in an open dashboard tab, since that data isn&apos;t backed by a shared database yet.
        </p>

        <DialogFooter>
          <DialogClose render={<Button type="button" />}>Done</DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
