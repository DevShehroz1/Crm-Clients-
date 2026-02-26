"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Inbox,
  CheckSquare,
  Hash,
  Plus,
  ChevronDown,
  Search,
  LayoutList,
  MessageSquare,
  Settings,
} from "lucide-react";

function AddChannelButton({ teamId, onAdded }: { teamId?: string; onAdded: () => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamId || !name.trim()) return;
    setSaving(true);
    fetch(`/api/teams/${teamId}/channels`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim() }),
    })
      .then((r) => {
        if (r.ok) {
          setName("");
          setOpen(false);
          onAdded();
        }
      })
      .catch(console.error)
      .finally(() => setSaving(false));
  };

  return (
    <>
      <button
        type="button"
        onClick={() => teamId && setOpen(true)}
        disabled={!teamId}
        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
      >
        <Plus className="h-4 w-4" />
        Add channel
      </button>
      {open && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/40"
            onClick={() => !saving && setOpen(false)}
            aria-hidden
          />
          <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-xl border border-slate-200 bg-white p-6 shadow-xl">
            <h3 className="mb-4 text-lg font-semibold text-slate-900">Create channel</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label htmlFor="channel-name" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Channel name
                </label>
                <input
                  id="channel-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. general, marketing"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                  autoFocus
                  disabled={saving}
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => !saving && setOpen(false)}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!name.trim() || saving}
                  className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-50"
                >
                  {saving ? "Creating…" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </>
  );
}
import { cn } from "@/lib/utils";
import { QuickAdd } from "@/components/quick-add";

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [createOpen, setCreateOpen] = useState(false);
  const [team, setTeam] = useState<{ id: string; name: string; channels: { id: string; name: string }[] } | null>(null);

  useEffect(() => {
    const t = localStorage.getItem("flux_team");
    if (t) {
      try {
        setTeam(JSON.parse(t));
      } catch {
        localStorage.removeItem("flux_team");
      }
    } else {
      fetch("/api/teams")
        .then((r) => (r.ok ? r.json() : []))
        .then((teams: { id: string; name: string; channels: { id: string; name: string }[] }[]) => {
          if (teams.length > 0) {
            localStorage.setItem("flux_team", JSON.stringify(teams[0]));
            setTeam(teams[0]);
          }
        });
    }
  }, []);

  useEffect(() => {
    if (team?.id) {
      fetch(`/api/teams/${team.id}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((t) => t && setTeam(t));
    }
  }, [team?.id, pathname]);

  const channels = team?.channels ?? [];

  return (
    <div className="flex h-screen bg-slate-50">
      <aside className="flex w-64 shrink-0 flex-col border-r border-slate-200 bg-white">
        <div className="flex h-14 items-center gap-2 border-b border-slate-200 px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600 text-white font-bold text-sm">
              F
            </div>
            <span className="font-semibold text-slate-900">Flux CRM</span>
          </Link>
        </div>
        <nav className="flex-1 overflow-y-auto p-3">
          <div className="space-y-1">
            <Link
              href="/app"
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium",
                pathname === "/app" ? "bg-violet-50 text-violet-700" : "text-slate-600 hover:bg-slate-100"
              )}
            >
              <Home className="h-4 w-4" />
              Home
            </Link>
            <Link
              href="/app/inbox"
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium",
                pathname === "/app/inbox" ? "bg-violet-50 text-violet-700" : "text-slate-600 hover:bg-slate-100"
              )}
            >
              <Inbox className="h-4 w-4" />
              Inbox
            </Link>
            <Link
              href="/app/tasks"
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium",
                pathname === "/app/tasks" ? "bg-violet-50 text-violet-700" : "text-slate-600 hover:bg-slate-100"
              )}
            >
              <CheckSquare className="h-4 w-4" />
              All Tasks
            </Link>
            <Link
              href="/app/settings/profile"
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium",
                pathname.startsWith("/app/settings") ? "bg-violet-50 text-violet-700" : "text-slate-600 hover:bg-slate-100"
              )}
            >
              <Settings className="h-4 w-4" />
              Settings
            </Link>
          </div>
          <div className="mt-6">
            <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Channels
            </p>
            <div className="space-y-1">
              {channels.map((ch) => (
                <Link
                  key={ch.id}
                  href={`/app/channel/${ch.id}`}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium",
                    pathname === `/app/channel/${ch.id}` ? "bg-violet-50 text-violet-700" : "text-slate-600 hover:bg-slate-100"
                  )}
                >
                  <Hash className="h-4 w-4" />
                  {ch.name}
                </Link>
              ))}
              <AddChannelButton teamId={team?.id} onAdded={() => {
                if (team?.id) {
                  fetch(`/api/teams/${team.id}`)
                    .then((r) => r.ok ? r.json() : null)
                    .then((t) => t && setTeam(t));
                }
              }} />
            </div>
          </div>
        </nav>
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-14 items-center justify-between border-b border-slate-200 bg-white px-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search"
                className="w-48 bg-transparent text-sm outline-none placeholder:text-slate-400"
              />
            </div>
            <div className="relative">
              <button
                onClick={() => setCreateOpen(!createOpen)}
                className="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
              >
                <Plus className="h-4 w-4" />
                Create
                <ChevronDown className="h-4 w-4" />
              </button>
              {createOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setCreateOpen(false)} />
                  <div className="absolute left-0 top-full z-50 mt-2 w-64 rounded-lg border border-slate-200 bg-white py-2 shadow-xl">
                    <p className="px-4 py-1 text-xs font-semibold text-slate-400">Create</p>
                    <Link
                      href="/app/tasks?new=1"
                      onClick={() => setCreateOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-slate-50"
                    >
                      <CheckSquare className="h-4 w-4" />
                      Task
                      <span className="ml-auto text-xs text-slate-400">⇧T</span>
                    </Link>
                    <Link
                      href={channels[0] ? `/app/channel/${channels[0].id}` : "/app"}
                      onClick={() => setCreateOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-slate-50"
                    >
                      <MessageSquare className="h-4 w-4" />
                      Message
                    </Link>
                    <div className="my-2 border-t border-slate-100" />
                    <p className="px-4 py-1 text-xs font-semibold text-slate-400">Organize</p>
                    <button className="flex w-full items-center gap-3 px-4 py-2 text-sm hover:bg-slate-50 text-left">
                      <LayoutList className="h-4 w-4" />
                      Channel
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500">{team?.name}</span>
          </div>
        </header>
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
      {team?.id && (
        <QuickAdd
          workspaceId={team.id}
          channelId={channels[0]?.id}
        />
      )}
    </div>
  );
}
