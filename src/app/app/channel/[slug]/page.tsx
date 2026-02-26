"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Star, MoreHorizontal, Paperclip, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Channel = {
  id: string;
  name: string;
  messages: { id: string; content: string; author: string; createdAt: string }[];
};

export default function ChannelPage() {
  const params = useParams();
  const id = params.slug as string;
  const [channel, setChannel] = useState<Channel | null>(null);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetch(`/api/channels/${id}`)
      .then((r) => (r.ok ? r.json() : null))
      .then(setChannel);
  }, [id]);

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
      </div>
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
    </div>
  );
}
