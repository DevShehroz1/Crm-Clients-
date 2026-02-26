"use client";

import { useState, useEffect } from "react";
import { loadSettings, updateProfile } from "@/lib/settings";
import { SaveInline } from "@/components/settings/save-inline";
import { Input } from "@/components/ui/input";

export default function ProfileSettingsPage() {
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [timezone, setTimezone] = useState("");
  const [language, setLanguage] = useState("en");
  const [workingStart, setWorkingStart] = useState("09:00");
  const [workingEnd, setWorkingEnd] = useState("17:00");
  const [workingWeekdays, setWorkingWeekdays] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const s = loadSettings();
    setName(s.profile.name || "");
    setTitle(s.profile.title || "");
    setTimezone(s.profile.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone);
    setLanguage(s.profile.language || "en");
    setWorkingStart(s.profile.workingHoursStart ?? "09:00");
    setWorkingEnd(s.profile.workingHoursEnd ?? "17:00");
    setWorkingWeekdays(s.profile.workingHoursWeekdays ?? true);
  }, []);

  const save = (patch: Parameters<typeof updateProfile>[0]) => {
    updateProfile(patch);
    setSaved(true);
    setTimeout(() => setSaved(false), 800);
  };

  const saveName = () => save({ name });
  const saveTitle = () => save({ title });
  const saveTimezone = () => save({ timezone });

  return (
    <div className="max-w-xl space-y-8">
      <div>
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">Profile</h2>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          Your name, role, and preferences.
        </p>
      </div>

      <div className="space-y-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6">
        <div className="flex items-end justify-between gap-4">
          <div className="flex-1">
            <label className="mb-2 block text-sm font-medium text-[var(--text-primary)]">Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={saveName}
              placeholder="Your name"
              className="bg-[var(--bg)]"
            />
          </div>
          <SaveInline show={saved} />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-[var(--text-primary)]">
            Title / Role
          </label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={saveTitle}
            placeholder="e.g. Product Manager"
            className="bg-[var(--bg)]"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-[var(--text-primary)]">
            Timezone
          </label>
          <Input
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            onBlur={saveTimezone}
            placeholder="America/New_York"
            className="bg-[var(--bg)]"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-[var(--text-primary)]">
            Language
          </label>
          <select
            value={language}
            onChange={(e) => save({ language: e.target.value })}
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm"
          >
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">German</option>
          </select>
        </div>

        <div className="border-t border-[var(--border)] pt-6">
          <h3 className="mb-4 text-sm font-medium text-[var(--text-primary)]">Working hours</h3>
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="mb-1 block text-xs text-[var(--text-secondary)]">Start</label>
              <input
                type="time"
                value={workingStart}
                onChange={(e) => setWorkingStart(e.target.value)}
                onBlur={() => save({ workingHoursStart: workingStart, workingHoursEnd: workingEnd })}
                className="rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-[var(--text-secondary)]">End</label>
              <input
                type="time"
                value={workingEnd}
                onChange={(e) => setWorkingEnd(e.target.value)}
                onBlur={() => save({ workingHoursStart: workingStart, workingHoursEnd: workingEnd })}
                className="rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm"
              />
            </div>
            <label className="flex cursor-pointer items-center gap-2 self-end">
              <input
                type="checkbox"
                checked={workingWeekdays}
                onChange={(e) => {
                  setWorkingWeekdays(e.target.checked);
                  save({ workingHoursWeekdays: e.target.checked });
                }}
                className="rounded border-[var(--border)]"
              />
              <span className="text-sm text-[var(--text-primary)]">Weekdays only</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
