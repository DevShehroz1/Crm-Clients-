"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  Loader2,
  Plus,
  MessageSquare,
  Mic,
  Play,
  ClipboardList,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { VoiceRecorder } from "@/components/voice-recorder";
import { cn } from "@/lib/utils";

const STATUS_LABELS: Record<string, string> = {
  TODO: "To Do",
  IN_PROGRESS: "In Progress",
  IN_REVIEW: "In Review",
  DONE: "Done",
};

const STATUS_STYLES: Record<string, string> = {
  TODO: "bg-slate-100 text-slate-600",
  IN_PROGRESS: "bg-amber-50 text-amber-700",
  IN_REVIEW: "bg-blue-50 text-blue-700",
  DONE: "bg-emerald-50 text-emerald-700",
};

type Task = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  comments: { id: string; content: string; author: string; createdAt: string }[];
  voiceNotes: { id: string; url: string; duration: number }[];
};

type Client = {
  id: string;
  name: string;
  company: string | null;
  slug: string;
  tasks: Task[];
};

export default function ClientPortalPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDesc, setNewTaskDesc] = useState("");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchClient = async () => {
    try {
      const res = await fetch(`/api/client/${slug}`);
      if (res.ok) {
        const data = await res.json();
        setClient(data);
        return data;
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
    return null;
  };

  useEffect(() => {
    fetchClient();
  }, [slug]);

  const createTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !client) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTaskTitle.trim(),
          description: newTaskDesc.trim() || undefined,
          clientId: client.id,
        }),
      });
      if (res.ok) {
        await fetchClient();
        setNewTaskTitle("");
        setNewTaskDesc("");
        setShowAddTask(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const addComment = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newComment.trim() || !selectedTask) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: newComment.trim(),
          taskId: selectedTask.id,
          author: "client",
        }),
      });
      if (res.ok) {
        setNewComment("");
        const updated = await fetchClient();
        if (updated && selectedTask) {
          const task = updated.tasks.find((t: Task) => t.id === selectedTask.id);
          setSelectedTask(task ?? null);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleVoiceNote = async (blob: Blob, duration: number) => {
    if (!selectedTask) return;
    setSubmitting(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        const res = await fetch("/api/voice-notes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            url: base64,
            taskId: selectedTask.id,
            duration,
          }),
        });
        if (res.ok) {
          const updated = await fetchClient();
          if (updated) {
            const task = updated.tasks.find((t: Task) => t.id === selectedTask.id);
            setSelectedTask(task ?? null);
          }
        }
        setSubmitting(false);
      };
    } catch (err) {
      console.error(err);
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50">
        <p className="text-slate-500">Portal not found</p>
      </div>
    );
  }

  const doneCount = client.tasks.filter((t) => t.status === "DONE").length;
  const total = client.tasks.length;
  const progress = total > 0 ? Math.round((doneCount / total) * 100) : 0;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-14 max-w-3xl items-center px-6">
          <div>
            <h1 className="text-base font-semibold text-slate-900">
              Task Portal
            </h1>
            <p className="text-xs text-slate-500">
              Assign tasks and track progress
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-8">
        <Card className="mb-6 overflow-hidden border-slate-200">
          <CardHeader className="border-b border-slate-100 bg-white py-4">
            <CardTitle className="text-sm font-medium text-slate-700">Progress</CardTitle>
            <p className="text-sm text-slate-500">
              {doneCount} of {total} tasks completed
            </p>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-violet-500 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </CardHeader>
        </Card>

        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900">Tasks</h2>
          {!showAddTask ? (
            <Button onClick={() => setShowAddTask(true)} size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Add Task
            </Button>
          ) : null}
        </div>

        {showAddTask && (
          <Card className="mb-6 border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">New Task</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={createTask} className="space-y-3">
                <Input
                  placeholder="Task title *"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  required
                />
                <Textarea
                  placeholder="Description (optional)"
                  value={newTaskDesc}
                  onChange={(e) => setNewTaskDesc(e.target.value)}
                  rows={3}
                />
                <div className="flex gap-2">
                  <Button type="submit" size="sm" disabled={submitting}>
                    {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add Task"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowAddTask(false);
                      setNewTaskTitle("");
                      setNewTaskDesc("");
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {client.tasks.length === 0 && !showAddTask ? (
          <Card className="border-dashed border-2 border-slate-200">
            <CardContent className="py-12 text-center">
              <ClipboardList className="mx-auto mb-4 h-12 w-12 text-slate-300" />
              <p className="text-slate-500">
                No tasks yet. Add your first task to get started.
              </p>
              <Button
                className="mt-4 gap-2"
                size="sm"
                onClick={() => setShowAddTask(true)}
              >
                <Plus className="h-4 w-4" />
                Add Task
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {client.tasks.map((task) => (
              <Card
                key={task.id}
                className={cn(
                  "cursor-pointer border-slate-200 transition-all hover:shadow-sm",
                  selectedTask?.id === task.id && "ring-2 ring-violet-200"
                )}
                onClick={() =>
                  setSelectedTask(selectedTask?.id === task.id ? null : task)
                }
              >
                <CardHeader className="py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-sm font-medium text-slate-900">
                        {task.title}
                      </CardTitle>
                      {task.description && (
                        <p className="mt-1 line-clamp-2 text-sm text-slate-500">
                          {task.description}
                        </p>
                      )}
                    </div>
                    <span
                      className={cn(
                        "shrink-0 rounded-md px-2 py-0.5 text-xs font-medium",
                        STATUS_STYLES[task.status] ?? STATUS_STYLES.TODO
                      )}
                    >
                      {STATUS_LABELS[task.status] ?? task.status}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <MessageSquare className="h-3.5 w-3.5" />
                      {task.comments.length}
                    </span>
                    <span className="flex items-center gap-1">
                      <Mic className="h-3.5 w-3.5" />
                      {task.voiceNotes.length}
                    </span>
                  </div>
                </CardHeader>

                {selectedTask?.id === task.id && (
                  <CardContent className="border-t border-slate-100 bg-slate-50/50 pt-4">
                    <h4 className="mb-3 text-xs font-medium text-slate-600">Comments</h4>
                    <div className="mb-4 max-h-40 space-y-2 overflow-y-auto">
                      {task.comments.map((c) => (
                        <div
                          key={c.id}
                          className="rounded-lg bg-white p-2.5 text-sm shadow-sm"
                        >
                          <p className="text-slate-700">{c.content}</p>
                          <p className="mt-1 text-xs text-slate-400">
                            {c.author} · {new Date(c.createdAt).toLocaleString()}
                          </p>
                        </div>
                      ))}
                      {task.voiceNotes.map((v) => (
                        <div
                          key={v.id}
                          className="flex items-center gap-2 rounded-lg bg-white p-2.5 shadow-sm"
                        >
                          <Play className="h-4 w-4 shrink-0 text-violet-500" />
                          <audio
                            src={v.url}
                            controls
                            className="h-8 flex-1"
                          />
                          <span className="text-xs text-slate-400">
                            {v.duration}s
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Message + Voice bar - WhatsApp / ClickUp style */}
                    <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white p-2">
                      <Input
                        placeholder="Type a message..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            addComment();
                          }
                        }}
                        className="flex-1 border-0 shadow-none focus-visible:ring-0"
                      />
                      <Button
                        type="button"
                        size="sm"
                        disabled={submitting || !newComment.trim()}
                        onClick={() => addComment()}
                      >
                        Send
                      </Button>
                      <VoiceRecorder
                        onRecorded={handleVoiceNote}
                        disabled={submitting}
                      />
                    </div>
                    <p className="mt-1.5 text-center text-xs text-slate-400">
                      Hold mic button to record voice note
                    </p>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
