"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  User,
  Bell,
  Palette,
  Building2,
  Hash,
  Keyboard,
  Plug,
} from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/app/settings/profile", label: "Profile", icon: User },
  { href: "/app/settings/notifications", label: "Notifications", icon: Bell },
  { href: "/app/settings/appearance", label: "Appearance", icon: Palette },
  { href: "/app/settings/workspace", label: "Workspace", icon: Building2 },
  { href: "/app/settings/channels", label: "Channels", icon: Hash },
  { href: "/app/settings/shortcuts", label: "Shortcuts", icon: Keyboard },
  { href: "/app/settings/integrations", label: "Integrations", icon: Plug },
];

export function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-full">
      <aside className="w-56 shrink-0 border-r border-[var(--border)] bg-[var(--surface)] p-4 motion-transition-med">
        <nav className="space-y-0.5">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const active = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium motion-transition-fast",
                  active
                    ? "bg-[var(--accent-muted)] text-[var(--accent)]"
                    : "text-[var(--text-secondary)] hover:bg-[var(--surface2)] hover:text-[var(--text-primary)]"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {tab.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <main className="flex-1 p-8 motion-page-fade">{children}</main>
    </div>
  );
}
