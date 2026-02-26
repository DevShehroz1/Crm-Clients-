"use client";

import { useState } from "react";
import { Building2 } from "lucide-react";

export default function WorkspaceSettingsPage() {
  return (
    <div className="max-w-xl space-y-8">
      <div>
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">Workspace</h2>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          Manage workspace name, logo, and members. Admin only.
        </p>
      </div>
      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6">
        <p className="text-sm text-[var(--text-secondary)]">
          Workspace settings (name, logo, members, roles) will be available here.
        </p>
      </div>
    </div>
  );
}
