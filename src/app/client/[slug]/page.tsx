"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  Loader2,
  Plus,
  MessageSquare,
  Mic,
  Play,
  CheckCircle2,
  Circle,
  Clock,
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
  TODO: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  IN_PROGRESS: "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300",
  IN_REVIEW: "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300",
  DONE: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300",
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

  const addComment = async (e: React.FormEvent) => {
    e.preventDefault();
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
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 dark:bg-slate-950">
        <p className="text-slate-500">Portal not found</p>
      </div>
    );
  }

  const doneCount = client.tasks.filter((t) => t.status === "DONE").length;
  const total = client.tasks.length;
  const progress = total > 0 ? Math.round((doneCount / total) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/80">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-6">
          <div>
            <h1 className="font-semibold text-slate-900 dark:text-slate-50">
              Task Portal
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Assign tasks and track progress
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-10">
        <Card className="mb-8 overflow-hidden">
          <CardHeader className="bg-slate-50 dark:bg-slate-900/50">
            <CardTitle className="text-base">Progress</CardTitle>
            <p className="text-sm text-slate-500">
              {doneCount} of {total} tasks completed
            </p>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </CardHeader>
        </Card>

        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Tasks</h2>
          {!showAddTask ? (
            <Button onClick={() => setShowAddTask(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Task
            </Button>
          ) : null}
        </div>

        {showAddTask && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-base">New Task</CardTitle>
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
                  placeholder="Description"
                  value={newTaskDesc}
                  onChange={(e) => setNewTaskDesc(e.target.value)}
                  rows={3}
                />
                <div className="flex gap-2">
                  <Button type="submit" disabled={submitting}>
                    {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add Task"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
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
          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <ClipboardList className="mx-auto mb-4 h-12 w-12 text-slate-300 dark:text-slate-600" />
              <p className="text-slate-500 dark:text-slate-400">
                No tasks yet. Add your first task to get started.
              </p>
              <Button
                className="mt-4 gap-2"
                onClick={() => setShowAddTask(true)}
              >
                <Plus className="h-4 w-4" />
                Add Task
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {client.tasks.map((task) => (
              <Card
                key={task.id}
                className={cn(
                  "cursor-pointer transition-all hover:shadow-md",
                  selectedTask?.id === task.id &&
                    "ring-2 ring-slate-400 dark:ring-slate-500"
                )}
                onClick={() =>
                  setSelectedTask(selectedTask?.id === task.id ? null : task)
                }
              >
                <CardHeader className="py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-base font-medium">
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
                        "shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium",
                        STATUS_STYLES[task.status] ?? STATUS_STYLES.TODO
                      )}
                    >
                      {STATUS_LABELS[task.status] ?? task.status}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-4 text-sm text-slate-500">
                    <span className="flex items-center gap-1">
                      <MessageSquare className="h-4 w-4" />
                      {task.comments.length}
                    </span>
                    <span className="flex items-center gap-1">
                      <Mic className="h-4 w-4" />
                      {task.voiceNotes.length}
                    </span>
                  </div>
                </CardHeader>

                {selectedTask?.id === task.id && (
                  <CardContent className="border-t border-slate-100 pt-4 dark:border-slate-800">
                    <h4 className="mb-3 text-sm font-medium">Comments & voice notes</h4>
                    <div className="mb-4 max-h-48 space-y-2 overflow-y-auto">
                      {task.comments.map((c) => (
                        <div
                          key={c.id}
                          className="rounded-lg bg-slate-50 p-2 text-sm dark:bg-slate-900"
                        >
                          <p>{c.content}</p>
                          <p className="mt-1 text-xs text-slate-500">
                            {c.author} · {new Date(c.createdAt).toLocaleString()}
                          </p>
                        </div>
                      ))}
                      {task.voiceNotes.map((v) => (
                        <div
                          key={v.id}
                          className="flex items-center gap-2 rounded-lg bg-slate-50 p-2 dark:bg-slate-900"
                        >
                          <Play className="h-4 w-4 text-slate-600" />
                          <audio
                            src={v.url}
                            controls
                            className="h-8 flex-1"
                          />
                          <span className="text-xs text-slate-500">
                            {v.duration}s
                          </span>
                        </div>
                      ))}
                    </div>
                    <form onSubmit={addComment} className="mb-4 flex gap-2">
                      <Input
                        placeholder="Add a message..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="flex-1"
                      />
                      <Button type="submit" disabled={submitting}>
                        Send
                      </Button>
                    </form>
                    <div className="flex items-center gap-2">
                      <VoiceRecorder
                        onRecorded={handleVoiceNote}
                        disabled={submitting}
                      />
                    </div>
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
