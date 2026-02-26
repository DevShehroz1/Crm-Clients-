"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

type QuickAddProps = {
  workspaceId: string | null;
  channelId?: string | null;
  onCreated?: () => void;
};

export function QuickAdd({ workspaceId, channelId, onCreated }: QuickAddProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const router = useRouter();

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((o) => !o);
        if (!open) setQuery("");
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const createTask = useCallback(async () => {
    if (!workspaceId || !query.trim()) return;
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: query.trim(),
        workspaceId,
        channelId: channelId || undefined,
      }),
    });
    if (res.ok) {
      const task = await res.json();
      setOpen(false);
      setQuery("");
      onCreated?.();
      router.push(`/app/tasks?task=${task.id}`);
    }
  }, [workspaceId, channelId, query, onCreated, router]);

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/40 transition-opacity duration-[120ms]"
        onClick={() => setOpen(false)}
        aria-hidden
      />
      <div className="fixed left-1/2 top-1/3 z-50 w-full max-w-xl -translate-x-1/2 -translate-y-1/2 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-2xl motion-modal-scale-in">
        <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-4">
          <span className="text-slate-400">Create task</span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") createTask();
              if (e.key === "Escape") setOpen(false);
            }}
            placeholder="Task name..."
            className="flex-1 border-0 bg-transparent py-3 outline-none"
            autoFocus
          />
          <kbd className="rounded bg-slate-200 px-2 py-1 text-xs text-slate-600">↵</kbd>
        </div>
        <p className="mt-2 text-xs text-slate-500">Press Enter to create · Esc to close</p>
      </div>
    </>
  );
}
