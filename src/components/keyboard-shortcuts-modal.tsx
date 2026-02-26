"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

const SHORTCUTS = [
  { keys: ["⌘", "K"], desc: "Quick add / Command palette" },
  { keys: ["⌘", "/"], desc: "Keyboard shortcuts help" },
  { keys: ["⇧", "T"], desc: "New task" },
  { keys: ["Tab", "Q"], desc: "Quick add (Asana-style)" },
  { keys: ["Esc"], desc: "Close drawer / modal" },
  { keys: ["/"], desc: "Slash commands in task name" },
];

export function KeyboardShortcutsModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) {
      document.addEventListener("keydown", handleKey);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/40 transition-opacity duration-[120ms]"
        style={{ transitionTimingFunction: "var(--ease-toggle)" }}
        onClick={onClose}
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal
        aria-labelledby="shortcuts-title"
        className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-xl asana-modal-pop"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 id="shortcuts-title" className="text-lg font-semibold text-[var(--text-primary)]">
            Keyboard shortcuts
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="asana-button-press">
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="space-y-3">
          {SHORTCUTS.map((s, i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-lg px-3 py-2 asana-row-hover"
            >
              <span className="text-sm text-[var(--text-primary)]">{s.desc}</span>
              <div className="flex gap-1">
                {s.keys.map((k, j) => (
                  <kbd
                    key={j}
                    className="rounded border border-[var(--border)] bg-[var(--surface2)] px-2 py-1 text-xs font-medium text-[var(--text-secondary)]"
                  >
                    {k}
                  </kbd>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
