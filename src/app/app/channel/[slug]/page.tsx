"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Star, MoreHorizontal, Paperclip, Send, Loader2, MessageSquare, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type ChannelUpdate = {
  id: string;
  type: string;
  body: string;
  entityType: string | null;
  entityId: string | null;
  actorEmail: string | null;
  createdAt: string;
};

type Channel = {
  id: string;
  name: string;
  messages: { id: string; content: string; author: string; createdAt: string }[];
};

export default function ChannelPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.slug as string;
  const [channel, setChannel] = useState<Channel | null>(null);
  const [updates, setUpdates] = useState<ChannelUpdate[]>([]);
  const [tab, setTab] = useState<"messages" | "updates">("messages");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetch(`/api/channels/${id}`)
      .then((r) => (r.ok ? r.json() : null))
      .then(setChannel);
  }, [id]);

  useEffect(() => {
    if (id && tab === "updates") {
      fetch(`/api/channels/${id}/updates`)
        .then((r) => (r.ok ? r.json() : []))
        .then(setUpdates);
    }
  }, [id, tab]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    setSending(true);
    try {
      const user = JSON.parse(localStorage.getItem("flux_user") || "{}");
      const res = await fetch(`/api/channels/${id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: message.trim(), author: user.name || user.email || "Anonymous" }),
      });
      if (res.ok) {
        setMessage("");
        const msg = await res.json();
        setChannel((c) => (c ? { ...c, messages: [...c.messages, msg] } : null));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  if (!channel) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  const channelName = channel.name.charAt(0).toUpperCase() + channel.name.slice(1);

  return (
    <div className="flex flex-1 flex-col">
      <div className="border-b border-slate-200 bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="font-semibold text-slate-900">#{channelName}</h1>
            <div className="flex rounded-lg border border-slate-200 p-0.5">
              <button
                type="button"
                onClick={() => setTab("messages")}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium",
                  tab === "messages" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
                )}
              >
                <MessageSquare className="h-4 w-4" /> Messages
              </button>
              <button
                type="button"
                onClick={() => setTab("updates")}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium",
                  tab === "updates" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
                )}
              >
                <Activity className="h-4 w-4" /> Updates
              </button>
            </div>
            <button className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
              <Star className="h-4 w-4" />
            </button>
          </div>
          <button className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-6">
        {tab === "updates" ? (
          <div className="space-y-3">
            {updates.length === 0 ? (
              <div className="rounded-lg border border-dashed border-slate-200 p-8 text-center text-slate-500">
                <Activity className="mx-auto mb-2 h-10 w-10 text-slate-300" />
                <p>No updates yet. Status changes and assignments will appear here.</p>
              </div>
            ) : (
              updates.map((u) => (
                <div
                  key={u.id}
                  className={cn(
                    "rounded-lg border px-4 py-3",
                    u.entityId && "cursor-pointer hover:bg-slate-50",
                    "border-slate-100 bg-slate-50/50"
                  )}
                  onClick={() => u.entityType === "task" && u.entityId && router.push(`/app/tasks?task=${u.entityId}`)}
                >
                  <p className="text-sm text-slate-600">{u.body}</p>
                  <p className="mt-1 text-xs text-slate-400">
                    {new Date(u.createdAt).toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </div>
        ) : (
        <div className="space-y-4">
          {channel.messages.length === 0 && (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-medium text-slate-700">
                Bookmark tasks, add notes, and more
              </p>
            </div>
          )}
          {channel.messages.map((m) => (
            <div key={m.id} className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-600 text-sm font-semibold text-white">
                {m.author[0]?.toUpperCase() || "U"}
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900">{m.author}</p>
                <p className="mt-1 text-sm text-slate-600">{m.content}</p>
                <p className="mt-0.5 text-xs text-slate-400">
                  {new Date(m.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
        )}
      </div>
      {tab === "messages" && (
      <form onSubmit={sendMessage} className="border-t border-slate-200 bg-white p-4">
        <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2">
          <button type="button" className="rounded p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-600">
            <Paperclip className="h-5 w-5" />
          </button>
          <Input
            placeholder={`Write to #${channelName}, press '/' for commands`}
            className="flex-1 border-0 bg-transparent"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <Button type="submit" size="icon" className="h-8 w-8" disabled={sending || !message.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
      )}
    </div>
  );
}
