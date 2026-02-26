"use client";

export default function ShortcutsSettingsPage() {
  return (
    <div className="max-w-xl space-y-8">
      <div>
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">Keyboard shortcuts</h2>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          View and customize keyboard shortcuts.
        </p>
      </div>
      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6">
        <p className="text-sm text-[var(--text-secondary)]">
          ⌘K Quick add · ⌘/ Search · More shortcuts coming soon.
        </p>
      </div>
    </div>
  );
}
