"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SettingsLayout } from "@/components/settings/settings-layout";

export default function SettingsRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col">
      <div className="border-b border-[var(--border)] bg-[var(--surface)] px-6 py-4">
        <Link
          href="/app"
          className="inline-flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] motion-transition-fast"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to workspace
        </Link>
        <h1 className="mt-2 text-xl font-semibold text-[var(--text-primary)]">Settings</h1>
      </div>
      <SettingsLayout>{children}</SettingsLayout>
    </div>
  );
}
