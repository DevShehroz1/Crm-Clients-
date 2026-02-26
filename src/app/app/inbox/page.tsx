"use client";

import { Inbox } from "lucide-react";

export default function InboxPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center p-8">
      <Inbox className="mb-4 h-16 w-16 text-slate-300" />
      <h2 className="text-lg font-semibold text-slate-900">Inbox</h2>
      <p className="mt-1 text-sm text-slate-500">No unread items</p>
    </div>
  );
}
