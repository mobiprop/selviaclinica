import { Bot, Calendar, FolderOpen, Megaphone } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { IconBadgeColor } from "@/components/ui/icon-badge";

export type IntegrationKind = "mcp" | "google-calendar" | "google-drive" | "meta-ads";

export type Integration = {
  id: IntegrationKind;
  name: string;
  description: string;
  icon: LucideIcon;
  color: IconBadgeColor;
};

export const INTEGRATIONS: Integration[] = [
  {
    id: "mcp",
    name: "MCP Connection",
    description: "Let AI assistants read and act on your clinic data via the Model Context Protocol.",
    icon: Bot,
    color: "violet",
  },
  {
    id: "google-calendar",
    name: "Google Calendar",
    description: "Sync patient appointments both ways with your clinic's calendar.",
    icon: Calendar,
    color: "blue",
  },
  {
    id: "google-drive",
    name: "Google Drive",
    description: "Import treatments and revenue straight from your cash-flow sheets.",
    icon: FolderOpen,
    color: "green",
  },
  {
    id: "meta-ads",
    name: "Meta Ads",
    description: "Pull campaign spend, revenue, and ROAS into the Campaign ROI Snapshot.",
    icon: Megaphone,
    color: "indigo",
  },
];
