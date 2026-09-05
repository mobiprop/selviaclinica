"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X, Loader2, ShieldAlert, MoreHorizontal, ShieldX } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

type AdminUser = {
  id: string;
  email: string;
  fullName: string;
  avatarUrl: string | null;
  role: "admin" | "staff";
  status: "pending" | "approved" | "denied";
  createdAt: string;
};

const STATUS_STYLES: Record<AdminUser["status"], string> = {
  approved: "bg-emerald-50 text-emerald-700",
  pending: "bg-amber-50 text-amber-700",
  denied: "bg-red-50 text-red-700",
};

function userInitials(fullName: string, email: string) {
  const trimmed = fullName.trim();
  if (trimmed) {
    const parts = trimmed.split(/\s+/);
    return `${parts[0]?.charAt(0) ?? ""}${parts[1]?.charAt(0) ?? ""}`.toUpperCase() || parts[0].slice(0, 2).toUpperCase();
  }
  return email.slice(0, 2).toUpperCase();
}

async function fetchUsers() {
  const res = await fetch("/api/admin/users");
  const data = await res.json();
  return { ok: res.ok, status: res.status, data };
}

export function UsersTable() {
  const router = useRouter();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [notAuthorized, setNotAuthorized] = useState(false);
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [revokeTarget, setRevokeTarget] = useState<AdminUser | null>(null);
  const [revoking, setRevoking] = useState(false);
  const [revokeError, setRevokeError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchUsers().then(({ ok, status, data }) => {
      if (cancelled) return;
      if (status === 403) {
        setNotAuthorized(true);
      } else if (ok) {
        setUsers(data.users ?? []);
      }
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  async function reload() {
    const { ok, data } = await fetchUsers();
    if (ok) setUsers(data.users ?? []);
  }

  async function handleAction(userId: string, action: "approve" | "deny") {
    setPendingAction(`${userId}:${action}`);
    try {
      await fetch(`/api/admin/users/${userId}/${action}`, { method: "POST" });
      await reload();
    } finally {
      setPendingAction(null);
    }
  }

  async function handleRevoke() {
    if (!revokeTarget) return;
    setRevoking(true);
    setRevokeError(null);
    try {
      const res = await fetch(`/api/admin/users/${revokeTarget.id}/revoke`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to revoke user");
      setRevokeTarget(null);
      await reload();
    } catch (err) {
      setRevokeError(err instanceof Error ? err.message : "Failed to revoke user");
    } finally {
      setRevoking(false);
    }
  }

  if (notAuthorized) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-10 text-center shadow-sm">
        <ShieldAlert className="h-6 w-6 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">You don&apos;t have access to this page.</p>
        <button onClick={() => router.replace("/")} className="text-sm font-medium text-primary hover:underline">
          Back to dashboard
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="px-4 py-3 font-medium">User</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Sign Up Date</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
                  <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
                  No users yet.
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={u.avatarUrl ?? ""} alt={u.fullName || u.email} />
                        <AvatarFallback className="bg-primary text-xs text-primary-foreground">
                          {userInitials(u.fullName, u.email)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <div className="truncate font-medium text-foreground">{u.fullName || "—"}</div>
                        <div className="truncate text-xs text-muted-foreground">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 capitalize text-muted-foreground">{u.role}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(u.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${STATUS_STYLES[u.status]}`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {u.role === "admin" ? (
                      <span className="text-xs text-muted-foreground">—</span>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleAction(u.id, "approve")}
                          disabled={pendingAction !== null || u.status === "approved"}
                          className="flex h-7 w-7 items-center justify-center rounded-md border border-emerald-200 text-emerald-700 hover:bg-emerald-50 disabled:opacity-40"
                          title="Approve"
                        >
                          <Check className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleAction(u.id, "deny")}
                          disabled={pendingAction !== null || u.status === "denied"}
                          className="flex h-7 w-7 items-center justify-center rounded-md border border-red-200 text-red-700 hover:bg-red-50 disabled:opacity-40"
                          title="Deny"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
                            title="More actions"
                          >
                            <MoreHorizontal className="h-3.5 w-3.5" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              variant="destructive"
                              onClick={() => {
                                setRevokeError(null);
                                setRevokeTarget(u);
                              }}
                            >
                              <ShieldX className="h-3.5 w-3.5" />
                              Revoke user
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={revokeTarget !== null} onOpenChange={(open) => !open && setRevokeTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Revoke {revokeTarget?.fullName || revokeTarget?.email}?</DialogTitle>
            <DialogDescription>
              This permanently deletes their account — not just their access. They&apos;ll need to register again
              from scratch to come back. This can&apos;t be undone.
            </DialogDescription>
          </DialogHeader>
          {revokeError && <p className="text-sm text-red-600">{revokeError}</p>}
          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>Cancel</DialogClose>
            <Button type="button" variant="destructive" disabled={revoking} onClick={handleRevoke}>
              {revoking && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Revoke user
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
