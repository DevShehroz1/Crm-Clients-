"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Inbox,
  MessageSquare,
  CheckSquare,
  Calendar,
  ListTodo,
  Star,
  Hash,
  Plus,
  ChevronDown,
  Users,
  MoreHorizontal,
  LayoutList,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/app", icon: Home, label: "Home" },
  { href: "/app/inbox", icon: Inbox, label: "Inbox" },
  { href: "/app/my-tasks", icon: CheckSquare, label: "My Tasks" },
  { href: "/app/clients", icon: Users, label: "Clients" },
];

const channelItems = [
  { href: "/app/channel/general", icon: Hash, label: "General" },
  { href: "/app/channel/tasks", icon: Hash, label: "Tasks" },
];

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
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
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  pathname === item.href || pathname.startsWith(item.href + "/")
                    ? "bg-violet-50 text-violet-700"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            ))}
          </div>
          <div className="mt-6">
            <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Channels
            </p>
            <div className="space-y-1">
              {channelItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    pathname === item.href
                      ? "bg-violet-50 text-violet-700"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  )}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  {item.label}
                </Link>
              ))}
              <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-700">
                <Plus className="h-4 w-4" />
                Add channel
              </button>
            </div>
          </div>
          <div className="mt-6">
            <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Favorites
            </p>
            <p className="px-3 text-sm text-slate-500">
              Click ☆ to add favorites
            </p>
          </div>
        </nav>
      </aside>

      {/* Main */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
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
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setCreateOpen(false)}
                  />
                  <div className="absolute left-0 top-full z-50 mt-2 w-64 rounded-lg border border-slate-200 bg-white py-2 shadow-xl">
                    <p className="px-4 py-1 text-xs font-semibold text-slate-400">Create</p>
                    <Link
                      href="/app/clients?create=task"
                      onClick={() => setCreateOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-slate-50"
                    >
                      <CheckSquare className="h-4 w-4" />
                      Task
                      <span className="ml-auto text-xs text-slate-400">⇧T</span>
                    </Link>
                    <Link
                      href="/app/channel/general"
                      onClick={() => setCreateOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-slate-50"
                    >
                      <MessageSquare className="h-4 w-4" />
                      Message
                    </Link>
                    <div className="my-2 border-t border-slate-100" />
                    <p className="px-4 py-1 text-xs font-semibold text-slate-400">Organize</p>
                    <button className="flex w-full items-center gap-3 px-4 py-2 text-sm hover:bg-slate-50">
                      <ListTodo className="h-4 w-4" />
                      List
                      <span className="text-xs text-slate-400">Track tasks & more</span>
                    </button>
                    <button className="flex w-full items-center gap-3 px-4 py-2 text-sm hover:bg-slate-50">
                      <Hash className="h-4 w-4" />
                      Channel
                      <span className="text-xs text-slate-400">Team conversations</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500">Refreshed: just now</span>
            <button className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-100 text-sm font-semibold text-violet-700">
              U
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
