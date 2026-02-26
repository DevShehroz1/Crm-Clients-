"use client";

import { useState, useRef, useEffect } from "react";
import { Send, AtSign, Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Member = { id: string; email: string; name: string | null };

export function CommentComposer({
  taskId,
  author,
  authorEmail,
  members,
  parentCommentId,
  placeholder,
  onSent,
  onVoiceNote,
}: {
  taskId: string;
  author: string;
  authorEmail?: string;
  members: Member[];
  parentCommentId?: string | null;
  placeholder?: string;
  onSent: () => void;
  onVoiceNote?: (blob: Blob, duration: number) => void;
}) {
  const [value, setValue] = useState("");
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [mentionIndex, setMentionIndex] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const composingRef = useRef(false);

  const filteredMembers = members.filter(
    (m) =>
      !value.includes(`@${m.email}`) &&
      (mentionQuery === "" ||
        m.name?.toLowerCase().includes(mentionQuery.toLowerCase()) ||
        m.email.toLowerCase().includes(mentionQuery.toLowerCase()))
  );

  const insertMention = (email: string, name: string) => {
    const before = value.slice(0, value.lastIndexOf("@"));
    const after = "";
    setValue(`${before}@${name || email} `);
    setShowMentions(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const v = e.target.value;
    setValue(v);
    const lastAtIndex = v.lastIndexOf("@");
    if (lastAtIndex >= 0) {
      const after = v.slice(lastAtIndex + 1);
      if (!/\s/.test(after)) {
        setShowMentions(true);
        setMentionQuery(after);
      } else {
        setShowMentions(false);
      }
    } else {
      setShowMentions(false);
    }
  };

  const extractMentions = (): string[] => {
    const emails: string[] = [];
    const regex = /@([^\s@]+)/g;
    let m;
    while ((m = regex.exec(value)) !== null) {
      const handle = m[1];
      const mem = members.find(
        (x) =>
          x.email === handle ||
          x.name?.toLowerCase() === handle.toLowerCase()
      );
      if (mem) emails.push(mem.email);
    }
    return [...new Set(emails)];
  };

  const send = async () => {
    const content = value.trim();
    if (!content) return;
    const mentions = extractMentions();
    const res = await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content,
        taskId,
        author,
        authorEmail: authorEmail || author,
        parentCommentId: parentCommentId || null,
        mentions,
      }),
    });
    if (res.ok) {
      setValue("");
      onSent();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (showMentions && filteredMembers.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setMentionIndex((i) => Math.min(i + 1, filteredMembers.length - 1));
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setMentionIndex((i) => Math.max(i - 1, 0));
        return;
      }
      if (e.key === "Enter" && filteredMembers.length > 0) {
        e.preventDefault();
        const m = filteredMembers[mentionIndex];
        insertMention(m.email, m.name || m.email);
        return;
      }
    }
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="relative">
      <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || "Add a comment… @mention to notify"}
          rows={3}
          className="w-full resize-none rounded-t-lg border-0 px-4 py-3 text-sm outline-none focus:ring-0"
        />
        <div className="flex items-center justify-between border-t border-slate-100 px-2 py-1.5">
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => {
                const v = value + " @";
                setValue(v);
                setShowMentions(true);
                setMentionQuery("");
              }}
              className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              title="Mention someone"
            >
              <AtSign className="h-4 w-4" />
            </button>
            {onVoiceNote && (
              <button
                type="button"
                onClick={() => {}}
                className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                title="Record voice note"
              >
                <Paperclip className="h-4 w-4" />
              </button>
            )}
          </div>
          <Button size="sm" onClick={send} disabled={!value.trim()}>
            <Send className="h-4 w-4" /> Send
          </Button>
        </div>
      </div>
      {showMentions && (
        <div className="absolute bottom-full left-0 z-10 mb-1 max-h-40 w-64 overflow-y-auto rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
          {filteredMembers.length === 0 ? (
            <p className="px-3 py-2 text-sm text-slate-500">No matches</p>
          ) : (
            filteredMembers.slice(0, 5).map((m, i) => (
              <button
                key={m.id}
                type="button"
                onClick={() => insertMention(m.email, m.name || m.email)}
                className={cn(
                  "flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-slate-50",
                  i === mentionIndex && "bg-violet-50"
                )}
              >
                <span className="font-medium">{m.name || m.email}</span>
                <span className="text-slate-500">{m.email}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
