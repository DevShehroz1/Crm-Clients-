"use client";

import { useState, useEffect } from "react";
import { X, Loader2, Plus, Check, MessageSquare, Bell, BellOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CommentComposer } from "@/components/comment-composer";
import { VoiceNoteRecorder } from "@/components/voice-note-recorder";
import { cn } from "@/lib/utils";

type Subtask = { id: string; title: string; isDone: boolean; orderIndex: number };
type Comment = {
  id: string;
  content: string;
  author: string;
  authorEmail?: string | null;
  createdAt: string;
  replies?: Comment[];
  mentions: { mentionedEmail: string }[];
  reactions: { emoji: string; author: string }[];
};

type Task = {
  id: string;
  shortCode?: string | null;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  assignee: string | null;
  assigneeId?: string | null;
  dueDate: string | null;
  subtasks?: Subtask[];
  comments?: Comment[];
  watchers?: { memberId: string }[];
  channel?: { id: string; name: string } | null;
};

type Member = { id: string; email: string; name: string | null };

const PRIORITY_STYLES: Record<string, string> = {
  LOW: "bg-slate-100 text-slate-600",
  NORMAL: "bg-blue-100 text-blue-700",
  MEDIUM: "bg-blue-100 text-blue-700",
  HIGH: "bg-amber-100 text-amber-700",
  URGENT: "bg-red-100 text-red-700",
};

export function TaskDrawer({
  taskId,
  workspaceId,
  members,
  onClose,
  onUpdated,
}: {
  taskId: string;
  workspaceId: string;
  members: Member[];
  onClose: () => void;
  onUpdated: () => void;
}) {
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [assignee, setAssignee] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [newSubtask, setNewSubtask] = useState("");
  const [activity, setActivity] = useState<{ actionType: string; createdAt: string }[]>([]);
  const [watching, setWatching] = useState(false);

  const userEmail = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("flux_user") || "{}")?.email : "";

  useEffect(() => {
    if (!taskId) return;
    Promise.all([
      fetch(`/api/tasks/${taskId}`).then((r) => (r.ok ? r.json() : null)),
      fetch(`/api/activity?workspaceId=${workspaceId}&entityType=task&entityId=${taskId}`).then((r) =>
        r.ok ? r.json() : []
      ),
    ]).then(([t, logs]) => {
      setTask(t);
      if (t) {
        setTitle(t.title);
        setDescription(t.description || "");
        setStatus(t.status);
        setPriority(t.priority || "NORMAL");
        setAssignee(t.assignee || "");
        setDueDate(t.dueDate ? new Date(t.dueDate).toISOString().slice(0, 10) : "");
        const me = members.find((m) => m.email === userEmail);
        setWatching(!!t.watchers?.some((w: { memberId: string }) => w.memberId === me?.id));
      }
      setActivity(logs || []);
      setLoading(false);
    });
  }, [taskId, workspaceId, userEmail, members]);

  const save = async (updates: Record<string, unknown>) => {
    if (!taskId || saving) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        const t = await res.json();
        setTask(t);
        onUpdated();
      }
    } finally {
      setSaving(false);
    }
  };

  const addSubtask = async () => {
    if (!newSubtask.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/tasks/${taskId}/subtasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newSubtask.trim() }),
      });
      if (res.ok) {
        const st = await res.json();
        setTask((prev) =>
          prev
            ? { ...prev, subtasks: [...(prev.subtasks || []), st].sort((a, b) => a.orderIndex - b.orderIndex) }
            : null
        );
        setNewSubtask("");
        onUpdated();
      }
    } finally {
      setSaving(false);
    }
  };

  const toggleSubtask = async (st: Subtask) => {
    const res = await fetch(`/api/subtasks/${st.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isDone: !st.isDone }),
    });
    if (res.ok) {
      const updated = await res.json();
      setTask((prev) =>
        prev
          ? {
              ...prev,
              subtasks: (prev.subtasks || []).map((s) => (s.id === st.id ? updated : s)),
            }
          : null
      );
      onUpdated();
    }
  };

  const toggleWatch = async () => {
    const me = members.find((m) => m.email === userEmail);
    if (!me) return;
    const res = await fetch(`/api/tasks/${taskId}/watchers`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ memberId: me.id }),
    });
    if (res.ok) {
      const data = await res.json();
      setWatching(!!data.watching);
      const t = await fetch(`/api/tasks/${taskId}`).then((r) => r.json());
      setTask(t);
      onUpdated();
    }
  };

  const addVoiceNote = async (blob: Blob, duration: number) => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = async () => {
      await fetch("/api/voice-notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: reader.result, taskId, duration }),
      });
      const t = await fetch(`/api/tasks/${taskId}`).then((r) => r.json());
      setTask(t);
      onUpdated();
    };
  };

  const debouncedSave = (() => {
    let timer: ReturnType<typeof setTimeout>;
    return (updates: Record<string, unknown>) => {
      clearTimeout(timer);
      timer = setTimeout(() => save(updates), 400);
    };
  })();

  if (loading || !task) {
    return (
      <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-xl flex-col border-l border-slate-200 bg-white shadow-xl">
        <div className="flex flex-1 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/30 transition-opacity duration-[120ms] ease-[cubic-bezier(0.65,0,0.35,1)]"
        onClick={onClose}
        aria-hidden
      />
      <div
        className="fixed inset-y-0 right-0 z-50 flex w-full max-w-xl flex-col border-l border-[var(--border)] bg-[var(--surface)] shadow-xl motion-drawer-slide-in"
        role="dialog"
      >
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="text-sm font-mono text-slate-500">{task.shortCode || task.id.slice(0, 8)}</span>
            <button
              type="button"
              onClick={toggleWatch}
              className={cn(
                "rounded-lg px-2 py-1 text-xs font-medium",
                watching ? "bg-violet-100 text-violet-700" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              )}
              title={watching ? "Unfollow" : "Follow"}
            >
              {watching ? <Bell className="h-3.5 w-3.5" /> : <BellOff className="h-3.5 w-3.5" />}
              {watching ? " Following" : " Follow"}
            </button>
            <span
              className={cn(
                "rounded-full px-2.5 py-0.5 text-xs font-medium",
                PRIORITY_STYLES[priority] || PRIORITY_STYLES.NORMAL
              )}
            >
              {priority}
            </span>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <Input
            className="mb-4 border-0 text-xl font-semibold shadow-none focus-visible:ring-0"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              debouncedSave({ title: e.target.value });
            }}
            placeholder="Task title"
          />

          <div className="mb-6 flex flex-wrap gap-2">
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                save({ status: e.target.value });
              }}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm"
            >
              <option value="Backlog">Backlog</option>
              <option value="TODO">Todo</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="Blocked">Blocked</option>
              <option value="Done">Done</option>
            </select>
            <select
              value={priority}
              onChange={(e) => {
                setPriority(e.target.value);
                save({ priority: e.target.value });
              }}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm"
            >
              <option value="LOW">Low</option>
              <option value="NORMAL">Normal</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
            <select
              value={assignee}
              onChange={(e) => {
                setAssignee(e.target.value);
                save({ assignee: e.target.value || null });
              }}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm"
            >
              <option value="">Unassigned</option>
              {members.map((m) => (
                <option key={m.id} value={m.email}>
                  {m.name || m.email}
                </option>
              ))}
            </select>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => {
                setDueDate(e.target.value);
                save({ dueDate: e.target.value || null });
              }}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm"
            />
          </div>

          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-slate-600">Description</label>
            <Textarea
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                debouncedSave({ description: e.target.value || null });
              }}
              placeholder="Add description..."
              rows={4}
              className="resize-none"
            />
          </div>

          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-slate-600">Subtasks</label>
            <div className="space-y-2">
              {(task.subtasks || []).map((st) => (
                <div
                  key={st.id}
                  className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2"
                >
                  <button
                    type="button"
                    onClick={() => toggleSubtask(st)}
                    className={cn(
                      "flex h-5 w-5 shrink-0 items-center justify-center rounded border",
                      st.isDone ? "border-emerald-500 bg-emerald-500 text-white" : "border-slate-300"
                    )}
                  >
                    {st.isDone ? <Check className="h-3 w-3" /> : null}
                  </button>
                  <span className={cn("flex-1 text-sm", st.isDone && "text-slate-500 line-through")}>
                    {st.title}
                  </span>
                </div>
              ))}
              <div className="flex gap-2">
                <Input
                  placeholder="Add subtask"
                  value={newSubtask}
                  onChange={(e) => setNewSubtask(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addSubtask()}
                />
                <Button size="sm" onClick={addSubtask} disabled={!newSubtask.trim() || saving}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-600">
              <MessageSquare className="h-4 w-4" /> Comments
            </label>
            <div className="space-y-4">
              {(task.comments || []).map((c) => (
                <div key={c.id} className="rounded-lg border border-slate-100 bg-slate-50/50 p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700">{c.author}</span>
                    <span className="text-xs text-slate-400">
                      {new Date(c.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate-600">{c.content}</p>
                  {c.reactions && c.reactions.length > 0 && (
                    <div className="mt-2 flex gap-1">
                      {Object.entries(
                        c.reactions.reduce(
                          (acc, r) => {
                            acc[r.emoji] = (acc[r.emoji] || 0) + 1;
                            return acc;
                          },
                          {} as Record<string, number>
                        )
                      ).map(([emoji, count]) => (
                        <span
                          key={emoji}
                          className="rounded bg-white px-1.5 py-0.5 text-xs"
                        >
                          {emoji} {count}
                        </span>
                      ))}
                    </div>
                  )}
                  {(c.replies?.length || 0) > 0 && (
                    <div className="mt-3 space-y-2 border-l-2 border-slate-200 pl-3">
                      {c.replies?.map((r) => (
                        <div key={r.id}>
                          <span className="text-xs font-medium text-slate-600">{r.author}</span>
                          <p className="text-sm text-slate-600">{r.content}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              <CommentComposer
                taskId={taskId}
                author={userEmail || "Anonymous"}
                authorEmail={userEmail}
                members={members}
                placeholder="Add a comment… @mention to notify"
                onSent={() => {
                  fetch(`/api/tasks/${taskId}`)
                    .then((r) => r.json())
                    .then(setTask);
                  onUpdated();
                }}
              />
              <div className="flex items-center gap-2">
                <VoiceNoteRecorder onRecorded={addVoiceNote} />
                <span className="text-xs text-slate-500">Record voice note</span>
              </div>
            </div>
          </div>

          {activity.length > 0 && (
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-600">Activity</label>
              <div className="space-y-2">
                {activity.slice(0, 10).map((log, i) => (
                  <div
                    key={i}
                    className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-sm text-slate-600"
                  >
                    <span className="font-medium">{log.actionType}</span> ·{" "}
                    {new Date(log.createdAt).toLocaleString()}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
