"use client";

import { Check } from "lucide-react";

/** ASANA_SaveInlinePing: inline "Saved ✓" per setting row - 120ms in, 500ms hold, 120ms out */
export function SaveInline({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <span
      className="save-inline-ping inline-flex items-center gap-1.5 text-sm font-medium text-[var(--success)]"
    >
      <Check className="h-4 w-4" />
      Saved
    </span>
  );
}
