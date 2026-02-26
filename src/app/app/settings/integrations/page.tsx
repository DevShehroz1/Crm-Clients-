"use client";

import { Slack, Webhook, Calendar } from "lucide-react";

export default function IntegrationsSettingsPage() {
  return (
    <div className="max-w-xl space-y-8">
      <div>
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">Integrations</h2>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          Connect Slack, webhooks, and calendar. Coming soon.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { icon: Slack, name: "Slack", desc: "Sync tasks and updates" },
          { icon: Webhook, name: "Webhooks", desc: "Outgoing events" },
          { icon: Calendar, name: "Calendar", desc: "Sync with Google Calendar" },
        ].map(({ icon: Icon, name, desc }) => (
          <div
            key={name}
            className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 opacity-60"
          >
            <Icon className="h-8 w-8 text-[var(--text-secondary)]" />
            <p className="mt-3 font-medium text-[var(--text-primary)]">{name}</p>
            <p className="text-sm text-[var(--text-secondary)]">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
