"use client";

import { useState, useEffect, useCallback } from "react";
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
  PanelLeftClose,
  PanelLeft,
  ChevronRight,
  User,
} from "lucide-react";
import { LayoutProvider, useLayout } from "@/lib/layout-context";
import { QuickAdd } from "@/components/quick-add";
import { KeyboardShortcutsModal } from "@/components/keyboard-shortcuts-modal";
import { cn } from "@/lib/utils";

function AddChannelButton({
  teamId,
  onAdded,
}: {
  teamId?: string;
  onAdded: () => void;
}) {
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
        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--surface2)] hover:text-[var(--text-primary)] disabled:opacity-50 asana-row-hover motion-transition-fast"
      >
        <Plus className="h-4 w-4" />
        Add channel
      </button>
      {open && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/40 transition-opacity duration-[120ms]"
            style={{ transitionTimingFunction: "var(--ease-toggle)" }}
            onClick={() => !saving && setOpen(false)}
            aria-hidden
          />
          <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-xl asana-modal-pop">
            <h3 className="mb-4 text-lg font-semibold text-[var(--text-primary)]">
              Create channel
            </h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label
                  htmlFor="channel-name"
                  className="mb-1.5 block text-sm font-medium text-[var(--text-primary)]"
                >
                  Channel name
                </label>
                <input
                  id="channel-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. general, marketing"
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-0"
                  autoFocus
                  disabled={saving}
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => !saving && setOpen(false)}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--surface2)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!name.trim() || saving}
                  className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--accent-hover)] disabled:opacity-50 asana-button-press"
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

function WorkspaceContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const {
    sidebarWidth,
    sidebarCollapsed,
    rightPaneWidth,
    toggleSidebar,
    startSidebarResize,
  } = useLayout();
  const [createOpen, setCreateOpen] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [team, setTeam] = useState<{
    id: string;
    name: string;
    channels: { id: string; name: string }[];
  } | null>(null);

  const channels = team?.channels ?? [];

  const loadTeam = useCallback(() => {
    fetch("/api/teams")
      .then((r) => (r.ok ? r.json() : []))
      .then((teams: { id: string; name: string; channels: { id: string; name: string }[] }[]) => {
        if (teams.length > 0) {
          localStorage.setItem("flux_team", JSON.stringify(teams[0]));
          setTeam(teams[0]);
        }
      });
  }, []);

  useEffect(() => {
    const t = localStorage.getItem("flux_team");
    if (t) {
      try {
        setTeam(JSON.parse(t));
      } catch {
        localStorage.removeItem("flux_team");
      }
    } else {
      loadTeam();
    }
  }, [loadTeam]);

  useEffect(() => {
    if (team?.id) {
      fetch(`/api/teams/${team.id}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((t) => t && setTeam(t));
    }
  }, [team?.id, pathname]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "/") {
        e.preventDefault();
        setShortcutsOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  const navLink = (href: string, label: string, Icon: typeof Home) => {
    const active =
      href === "/app"
        ? pathname === "/app"
        : pathname === href || pathname.startsWith(href + "/");
    return (
      <Link
        href={href}
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium motion-transition-fast asana-row-hover",
          active
            ? "bg-[var(--accent-soft)] text-[var(--accent)]"
            : "text-[var(--text-secondary)] hover:bg-[var(--surface2)] hover:text-[var(--text-primary)]"
        )}
      >
        <Icon className="h-4 w-4 shrink-0" />
        {!sidebarCollapsed && <span>{label}</span>}
      </Link>
    );
  };

  return (
    <div className="flex h-screen bg-[var(--bg)]">
      {/* Left Sidebar - resizable 240–360px, collapse to 64px */}
      <aside
        className="relative flex shrink-0 flex-col border-r border-[var(--border)] bg-[var(--surface)] transition-[width] duration-[240ms]"
        style={{
          width: sidebarCollapsed ? 64 : sidebarWidth,
          transitionTimingFunction: "var(--ease-toggle)",
        }}
      >
        <div
          className={cn(
            "flex h-14 shrink-0 items-center gap-2 border-b border-[var(--border)] px-3 transition-opacity duration-300",
            sidebarCollapsed && "justify-center"
          )}
        >
          <Link href="/" className="flex items-center gap-2">
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--accent)] text-white font-bold text-sm"
            >
              F
            </div>
            {!sidebarCollapsed && (
              <span className="font-semibold text-[var(--text-primary)]">Flux CRM</span>
            )}
          </Link>
        </div>
        <nav className="flex-1 overflow-y-auto p-3">
          <div className="space-y-0.5">
            {navLink("/app", "Home", Home)}
            {navLink("/app/inbox", "Inbox", Inbox)}
            {navLink("/app/tasks", "My Tasks", CheckSquare)}
            {navLink("/app/settings/profile", "Settings", Settings)}
          </div>
          <div className="mt-6">
            {!sidebarCollapsed && (
              <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                Channels
              </p>
            )}
            <div className="space-y-0.5">
              {channels.map((ch) => (
                <Link
                  key={ch.id}
                  href={`/app/channel/${ch.id}`}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium motion-transition-fast asana-row-hover",
                    pathname === `/app/channel/${ch.id}`
                      ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                      : "text-[var(--text-secondary)] hover:bg-[var(--surface2)] hover:text-[var(--text-primary)]"
                  )}
                >
                  <Hash className="h-4 w-4 shrink-0" />
                  {!sidebarCollapsed && <span>{ch.name}</span>}
                </Link>
              ))}
              <AddChannelButton
                teamId={team?.id}
                onAdded={() =>
                  team?.id &&
                  fetch(`/api/teams/${team.id}`)
                    .then((r) => (r.ok ? r.json() : null))
                    .then((t) => t && setTeam(t))
                }
              />
            </div>
          </div>
        </nav>
        {/* Collapse toggle */}
        <button
          type="button"
          onClick={toggleSidebar}
          className="absolute -right-3 top-20 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] shadow-sm hover:bg-[var(--surface2)] hover:text-[var(--text-primary)] motion-transition-fast"
          aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {sidebarCollapsed ? (
            <PanelLeft className="h-3.5 w-3.5" />
          ) : (
            <PanelLeftClose className="h-3.5 w-3.5" />
          )}
        </button>
        {/* Resize handle */}
        {!sidebarCollapsed && (
          <div
            className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-[var(--accent)]/20"
            onMouseDown={startSidebarResize}
            aria-hidden
          />
        )}
      </aside>

      {/* Main content + Top bar */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Top Bar - 56px fixed */}
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-[var(--border)] bg-[var(--surface)] px-6">
          <div className="flex flex-1 items-center gap-4">
            <div className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2">
              <Search className="h-4 w-4 text-[var(--text-secondary)]" />
              <input
                type="text"
                placeholder="Search (⌘K)"
                className="w-48 bg-transparent text-sm outline-none placeholder:text-[var(--text-secondary)]"
              />
            </div>
            <div className="relative">
              <button
                onClick={() => setCreateOpen(!createOpen)}
                className="flex items-center gap-2 rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--accent-hover)] asana-button-press"
              >
                <Plus className="h-4 w-4" />
                Create
                <ChevronDown className="h-4 w-4" />
              </button>
              {createOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setCreateOpen(false)}
                    aria-hidden
                  />
                  <div className="absolute left-0 top-full z-50 mt-2 w-64 rounded-lg border border-[var(--border)] bg-[var(--surface)] py-2 shadow-lg asana-dropdown-pop">
                    <p className="px-4 py-1 text-xs font-semibold text-[var(--text-secondary)]">
                      Create
                    </p>
                    <Link
                      href="/app/tasks?new=1"
                      onClick={() => setCreateOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-[var(--surface2)] asana-row-hover motion-transition-fast"
                    >
                      <CheckSquare className="h-4 w-4" />
                      Task
                      <span className="ml-auto text-xs text-[var(--text-secondary)]">⇧T</span>
                    </Link>
                    <Link
                      href={channels[0] ? `/app/channel/${channels[0].id}` : "/app"}
                      onClick={() => setCreateOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-[var(--surface2)] asana-row-hover motion-transition-fast"
                    >
                      <MessageSquare className="h-4 w-4" />
                      Message
                    </Link>
                    <div className="my-2 border-t border-[var(--border)]" />
                    <p className="px-4 py-1 text-xs font-semibold text-[var(--text-secondary)]">
                      Organize
                    </p>
                    <button className="flex w-full items-center gap-3 px-4 py-2 text-sm hover:bg-[var(--surface2)] text-left asana-row-hover motion-transition-fast">
                      <LayoutList className="h-4 w-4" />
                      Channel
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShortcutsOpen(true)}
              className="rounded-lg px-2 py-1.5 text-sm text-[var(--text-secondary)] hover:bg-[var(--surface2)] hover:text-[var(--text-primary)] motion-transition-fast"
              title="Shortcuts (⌘/)"
            >
              ⌘/
            </button>
            <span className="text-sm text-[var(--text-secondary)]">{team?.name}</span>
            <div className="relative">
              <button
                onClick={() => setAvatarOpen(!avatarOpen)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--accent-soft)] text-[var(--accent)] hover:bg-[var(--accent)] hover:text-white motion-transition-fast asana-button-press"
              >
                <User className="h-4 w-4" />
              </button>
              {avatarOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setAvatarOpen(false)}
                    aria-hidden
                  />
                  <div className="absolute right-0 top-full z-50 mt-2 w-48 rounded-lg border border-[var(--border)] bg-[var(--surface)] py-2 shadow-lg asana-dropdown-pop">
                    <Link
                      href="/app/settings/profile"
                      onClick={() => setAvatarOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--surface2)] asana-row-hover motion-transition-fast"
                    >
                      <Settings className="h-4 w-4" />
                      Settings
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-auto">{children}</main>
      </div>

      {team?.id && <QuickAdd workspaceId={team.id} channelId={channels[0]?.id} />}
      <KeyboardShortcutsModal open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
    </div>
  );
}

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  return (
    <LayoutProvider>
      <WorkspaceContent>{children}</WorkspaceContent>
    </LayoutProvider>
  );
}
