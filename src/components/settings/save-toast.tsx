"use client";

import { useEffect, useState } from "react";
import { Check } from "lucide-react";

export function SaveToast({ show, onHide }: { show: boolean; onHide: () => void }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setVisible(true);
      const t1 = setTimeout(() => setVisible(false), 120);
      const t2 = setTimeout(onHide, 640);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
  }, [show, onHide]);

  if (!show) return null;

  return (
    <div
      className={`fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm font-medium text-[var(--success)] shadow-lg motion-toast-slide-up ${!visible ? "opacity-0 transition-opacity duration-[120ms]" : ""}`}
    >
      <Check className="h-4 w-4" />
      Saved
    </div>
  );
}
