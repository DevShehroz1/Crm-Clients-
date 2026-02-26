"use client";

export default function ChannelsSettingsPage() {
  return (
    <div className="max-w-xl space-y-8">
      <div>
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">Channels</h2>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          Create, edit, and manage channels. Configure status workflows.
        </p>
      </div>
      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6">
        <p className="text-sm text-[var(--text-secondary)]">
          Channel management (create/edit/delete, private toggle, status workflow editor) will be
          available here.
        </p>
      </div>
    </div>
  );
}
