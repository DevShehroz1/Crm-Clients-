"use client";

import { useState, useEffect } from "react";
import { loadSettings, updateProfile } from "@/lib/settings";
import { SaveToast } from "@/components/settings/save-toast";
import { Input } from "@/components/ui/input";

export default function ProfileSettingsPage() {
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [timezone, setTimezone] = useState("");
  const [language, setLanguage] = useState("en");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const s = loadSettings();
    setName(s.profile.name || "");
    setTitle(s.profile.title || "");
    setTimezone(s.profile.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone);
    setLanguage(s.profile.language || "en");
  }, []);

  const save = () => {
    updateProfile({ name, title, timezone, language });
    setSaved(true);
    setTimeout(() => setSaved(false), 1000);
  };

  return (
    <div className="max-w-xl space-y-8">
      <div>
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">Profile</h2>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          Your name, role, and preferences.
        </p>
      </div>

      <div className="space-y-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6">
        <div>
          <label className="mb-2 block text-sm font-medium text-[var(--text-primary)]">
            Name
          </label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={save}
            placeholder="Your name"
            className="bg-[var(--bg)]"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-[var(--text-primary)]">
            Title / Role
          </label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={save}
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
            onBlur={save}
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
            onChange={(e) => {
              setLanguage(e.target.value);
              save();
            }}
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm"
          >
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">German</option>
          </select>
        </div>
      </div>

      <SaveToast show={saved} onHide={() => setSaved(false)} />
    </div>
  );
}
