"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FolderKanban,
  FileText,
  Bookmark,
  Plus,
  LayoutList,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function WorkspaceHomePage() {
  const [user, setUser] = useState<{ name: string } | null>(null);

  useEffect(() => {
    const u = localStorage.getItem("flux_user");
    if (u) setUser(JSON.parse(u));
  }, []);

  return (
    <div className="p-8">
      <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        Get the most out of your Overview! Add, reorder, and resize cards to customize this page.
        <Link href="/get-started" className="ml-2 font-medium underline">
          Get Started
        </Link>
      </div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Welcome{user?.name ? `, ${user.name}` : ""}
          </h1>
          <p className="text-slate-600">Your workspace at a glance</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500">Refreshed: just now</span>
          <Button variant="outline" size="sm">
            Customize
          </Button>
          <Button size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Add card
          </Button>
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-900">Recent</h3>
            <Button variant="ghost" size="sm">
              Filters
            </Button>
          </div>
          <div className="mt-4 rounded-lg border-2 border-dashed border-slate-200 py-12 text-center text-slate-500">
            <LayoutList className="mx-auto mb-2 h-10 w-10" />
            <p className="text-sm">No recent items</p>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h3 className="font-semibold text-slate-900">Docs</h3>
          <div className="mt-4 flex flex-col items-center justify-center py-12 text-center text-slate-500">
            <FileText className="mb-2 h-12 w-12" />
            <p className="text-sm">No Docs in this location yet.</p>
            <Button size="sm" className="mt-4">
              Add a Doc
            </Button>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h3 className="font-semibold text-slate-900">Bookmarks</h3>
          <div className="mt-4 flex flex-col items-center justify-center py-12 text-center text-slate-500">
            <Bookmark className="mb-2 h-12 w-12" />
            <p className="text-sm">Save items or URLs for quick access.</p>
            <Button size="sm" className="mt-4">
              Add Bookmark
            </Button>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6 md:col-span-2 lg:col-span-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-900">Folders</h3>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon">
                <LayoutList className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="mt-4 flex flex-col items-center justify-center py-12 text-center text-slate-500">
            <FolderKanban className="mb-2 h-12 w-12" />
            <p className="text-sm">Add new Folder to your Space</p>
            <Button size="sm" className="mt-4">
              Add Folder
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
