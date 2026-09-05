import { Bot, Calendar, FolderOpen, Megaphone } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { IconBadgeColor } from "@/components/ui/icon-badge";

export type Integration = {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  color: IconBadgeColor;
  status: "connected" | "available";
};

export const INTEGRATIONS: Integration[] = [
  {
    id: "mcp",
    name: "MCP Connection",
    description: "Let AI assistants read and act on your clinic data via the Model Context Protocol.",
    icon: Bot,
    color: "violet",
    status: "available",
  },
  {
    id: "google-calendar",
    name: "Google Calendar",
    description: "Sync patient appointments both ways with your clinic's calendar.",
    icon: Calendar,
    color: "blue",
    status: "available",
  },
  {
    id: "google-drive",
    name: "Google Drive",
    description: "Import treatments and revenue straight from your cash-flow sheets.",
    icon: FolderOpen,
    color: "green",
    status: "available",
  },
  {
    id: "meta-ads",
    name: "Meta Ads",
    description: "Pull campaign spend, revenue, and ROAS into the Campaign ROI Snapshot.",
    icon: Megaphone,
    color: "indigo",
    status: "available",
  },
];
