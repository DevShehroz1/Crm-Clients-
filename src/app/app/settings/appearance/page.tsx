"use client";

import { useState, useEffect } from "react";
import { useTheme } from "@/components/theme-provider";
import { loadSettings, ACCENT_COLORS } from "@/lib/settings";
import { SaveToast } from "@/components/settings/save-toast";

const ACCENT_OPTIONS = [
  { id: "violet", label: "Violet", hex: "#7c3aed" },
  { id: "blue", label: "Blue", hex: "#2563eb" },
  { id: "emerald", label: "Emerald", hex: "#059669" },
  { id: "amber", label: "Amber", hex: "#d97706" },
  { id: "rose", label: "Rose", hex: "#e11d48" },
  { id: "indigo", label: "Indigo", hex: "#4f46e5" },
  { id: "teal", label: "Teal", hex: "#0d9488" },
] as const;

export default function AppearanceSettingsPage() {
  const { settings, updateAppearance } = useTheme();
  const [theme, setTheme] = useState(settings.appearance.theme);
  const [accent, setAccent] = useState(settings.appearance.accent);
  const [accentHex, setAccentHex] = useState(settings.appearance.accentHex || "");
  const [density, setDensity] = useState(settings.appearance.density);
  const [fontSize, setFontSize] = useState(settings.appearance.fontSize);
  const [reduceMotion, setReduceMotion] = useState(settings.appearance.reduceMotion);
  const [sidebarAutoCollapse, setSidebarAutoCollapse] = useState(
    settings.appearance.sidebarAutoCollapse
  );
  const [saved, setSaved] = useState(false);

  const save = (patch: Parameters<typeof updateAppearance>[0]) => {
    updateAppearance(patch);
    setSaved(true);
    setTimeout(() => setSaved(false), 1000);
  };

  return (
    <div className="max-w-xl space-y-8">
      <div>
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">Appearance</h2>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          Theme, accent color, and display preferences.
        </p>
      </div>

      <div className="space-y-6 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6">
        <div>
          <h3 className="mb-4 text-sm font-medium text-[var(--text-primary)]">Theme</h3>
          <div className="flex gap-2">
            {(["light", "dark", "system"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => {
                  setTheme(t);
                  save({ theme: t });
                }}
                className={`rounded-lg border px-4 py-2 text-sm font-medium capitalize motion-transition-fast ${
                  theme === t
                    ? "border-[var(--accent)] bg-[var(--accent-muted)] text-[var(--accent)]"
                    : "border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--surface2)]"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-medium text-[var(--text-primary)]">Accent color</h3>
          <div className="flex flex-wrap gap-2">
            {ACCENT_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  setAccent(opt.id);
                  setAccentHex("");
                  save({ accent: opt.id, accentHex: undefined });
                }}
                className={`flex h-9 w-9 items-center justify-center rounded-full border-2 motion-transition-fast ${
                  accent === opt.id
                    ? "border-[var(--text-primary)]"
                    : "border-transparent hover:border-[var(--border)]"
                }`}
                style={{ backgroundColor: opt.hex }}
                title={opt.label}
              />
            ))}
          </div>
          <div className="mt-3">
            <label className="mb-1 block text-xs text-[var(--text-secondary)]">Custom hex</label>
            <input
              type="text"
              value={accentHex}
              onChange={(e) => setAccentHex(e.target.value)}
              onBlur={() => {
                if (/^#[0-9A-Fa-f]{6}$/.test(accentHex)) {
                  save({ accent: "custom", accentHex });
                }
              }}
              placeholder="#7c3aed"
              className="w-32 rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-medium text-[var(--text-primary)]">Density</h3>
          <div className="flex gap-2">
            {(["comfortable", "compact"] as const).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => {
                  setDensity(d);
                  save({ density: d });
                }}
                className={`rounded-lg border px-4 py-2 text-sm font-medium capitalize motion-transition-fast ${
                  density === d
                    ? "border-[var(--accent)] bg-[var(--accent-muted)] text-[var(--accent)]"
                    : "border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--surface2)]"
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-medium text-[var(--text-primary)]">Font size</h3>
          <div className="flex gap-2">
            {(["small", "default", "large"] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => {
                  setFontSize(f);
                  save({ fontSize: f });
                }}
                className={`rounded-lg border px-4 py-2 text-sm font-medium capitalize motion-transition-fast ${
                  fontSize === f
                    ? "border-[var(--accent)] bg-[var(--accent-muted)] text-[var(--accent)]"
                    : "border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--surface2)]"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-[var(--border)] pt-6">
          <div>
            <p className="text-sm font-medium text-[var(--text-primary)]">Reduce motion</p>
            <p className="text-xs text-[var(--text-secondary)]">
              Disable scale and slide animations; keep only fades
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={reduceMotion}
            onClick={() => {
              setReduceMotion(!reduceMotion);
              save({ reduceMotion: !reduceMotion });
            }}
            className={`relative h-6 w-11 rounded-full motion-transition-med ${
              reduceMotion ? "bg-[var(--accent)]" : "bg-[var(--border)]"
            }`}
          >
            <span
              className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm motion-transition-med ${
                reduceMotion ? "left-6" : "left-1"
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between border-t border-[var(--border)] pt-6">
          <div>
            <p className="text-sm font-medium text-[var(--text-primary)]">Sidebar auto-collapse</p>
            <p className="text-xs text-[var(--text-secondary)]">Collapse on small screens</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={sidebarAutoCollapse}
            onClick={() => {
              setSidebarAutoCollapse(!sidebarAutoCollapse);
              save({ sidebarAutoCollapse: !sidebarAutoCollapse });
            }}
            className={`relative h-6 w-11 rounded-full motion-transition-med ${
              sidebarAutoCollapse ? "bg-[var(--accent)]" : "bg-[var(--border)]"
            }`}
          >
            <span
              className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm motion-transition-med ${
                sidebarAutoCollapse ? "left-6" : "left-1"
              }`}
            />
          </button>
        </div>
      </div>

      <SaveToast show={saved} onHide={() => setSaved(false)} />
    </div>
  );
}
