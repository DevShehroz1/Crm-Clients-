"use client";

import { useParams } from "next/navigation";
import { Star, MoreHorizontal, Paperclip, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ChannelPage() {
  const params = useParams();
  const slug = params.slug as string;
  const channelName = slug === "general" ? "General" : slug.charAt(0).toUpperCase() + slug.slice(1);

  return (
    <div className="flex flex-1 flex-col">
      <div className="border-b border-slate-200 bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="font-semibold text-slate-900">#{channelName}</h1>
            <button className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
              <Star className="h-4 w-4" />
            </button>
          </div>
          <button className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-2 flex gap-2">
          <button className="rounded-lg bg-violet-50 px-3 py-1 text-sm font-medium text-violet-700">
            Channel
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-4">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-medium text-slate-700">
              Bookmark tasks, add notes, and more
            </p>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-600 text-sm font-semibold text-white">
              U
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900">You</p>
              <p className="mt-1 text-sm text-slate-600">
                Write to #{channelName}, press space for AI, / for commands
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-slate-200 bg-white p-4">
        <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2">
          <button className="rounded p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-600">
            <Paperclip className="h-5 w-5" />
          </button>
          <Input
            placeholder={`Write to #${channelName}, press 'space' for AI, '/' for commands`}
            className="flex-1 border-0 bg-transparent"
          />
          <Button size="icon" className="h-8 w-8">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
