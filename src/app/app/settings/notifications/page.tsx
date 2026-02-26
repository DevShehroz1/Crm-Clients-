"use client";

import { useState, useEffect } from "react";
import { loadSettings, updateNotifications } from "@/lib/settings";
import { SaveToast } from "@/components/settings/save-toast";

export default function NotificationSettingsPage() {
  const [prefs, setPrefs] = useState(loadSettings().notifications);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setPrefs(loadSettings().notifications);
  }, []);

  const update = (patch: Partial<typeof prefs>) => {
    const next = { ...prefs, ...patch };
    setPrefs(next);
    updateNotifications(patch);
    setSaved(true);
    setTimeout(() => setSaved(false), 1000);
  };

  return (
    <div className="max-w-xl space-y-8">
      <div>
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">Notifications</h2>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          Choose what you want to be notified about.
        </p>
      </div>

      <div className="space-y-6 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6">
        <div>
          <h3 className="mb-4 text-sm font-medium text-[var(--text-primary)]">By type</h3>
          <div className="space-y-3">
            {[
              { key: "mentions" as const, label: "Mentions" },
              { key: "assignments" as const, label: "Assignments" },
              { key: "comments" as const, label: "Comments" },
              { key: "reactions" as const, label: "Reactions" },
              { key: "dueSoon" as const, label: "Due soon" },
              { key: "statusChanges" as const, label: "Status changes" },
              { key: "channelUpdates" as const, label: "Channel updates" },
            ].map(({ key, label }) => (
              <label
                key={key}
                className="flex cursor-pointer items-center justify-between"
              >
                <span className="text-sm text-[var(--text-primary)]">{label}</span>
                <ToggleSwitch
                  checked={prefs[key]}
                  onChange={(v) => update({ [key]: v })}
                />
              </label>
            ))}
          </div>
        </div>

        <div className="border-t border-[var(--border)] pt-6">
          <h3 className="mb-4 text-sm font-medium text-[var(--text-primary)]">Quiet hours</h3>
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="mb-1 block text-xs text-[var(--text-secondary)]">Start</label>
              <input
                type="time"
                value={prefs.quietHoursStart}
                onChange={(e) => update({ quietHoursStart: e.target.value })}
                className="rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-[var(--text-secondary)]">End</label>
              <input
                type="time"
                value={prefs.quietHoursEnd}
                onChange={(e) => update({ quietHoursEnd: e.target.value })}
                className="rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm"
              />
            </div>
            <label className="flex cursor-pointer items-center gap-2 self-end">
              <input
                type="checkbox"
                checked={prefs.quietHoursWeekends}
                onChange={(e) => update({ quietHoursWeekends: e.target.checked })}
                className="rounded border-[var(--border)]"
              />
              <span className="text-sm text-[var(--text-primary)]">Include weekends</span>
            </label>
          </div>
        </div>

        <div className="border-t border-[var(--border)] pt-6">
          <h3 className="mb-4 text-sm font-medium text-[var(--text-primary)]">Digest</h3>
          <select
            value={prefs.digestFrequency}
            onChange={(e) =>
              update({ digestFrequency: e.target.value as "off" | "daily" | "weekly" })
            }
            className="rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm"
          >
            <option value="off">Off</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
          </select>
        </div>
      </div>

      <SaveToast show={saved} onHide={() => setSaved(false)} />
    </div>
  );
}

function ToggleSwitch({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 rounded-full motion-transition-med ${
        checked ? "bg-[var(--accent)]" : "bg-[var(--border)]"
      }`}
    >
      <span
        className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm motion-transition-med ${
          checked ? "left-6" : "left-1"
        }`}
      />
    </button>
  );
}
