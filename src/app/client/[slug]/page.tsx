"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import {
  Loader2,
  Plus,
  MessageSquare,
  Mic,
  Play,
  ClipboardList,
  Paperclip,
  FileText,
  X,
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
  attachments: { id: string; url: string; fileName: string }[];
};

type Client = {
  id: string;
  name: string;
  company: string | null;
  slug: string;
  tasks: Task[];
};

type PendingFile = { file: File; preview?: string };

export default function ClientPortalPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDesc, setNewTaskDesc] = useState("");
  const [newTaskDueDate, setNewTaskDueDate] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState("MEDIUM");
  const [pendingVoice, setPendingVoice] = useState<{ blob: Blob; duration: number } | null>(null);
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fileInputRefComment = useRef<HTMLInputElement>(null);

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
          priority: newTaskPriority,
          dueDate: newTaskDueDate || undefined,
        }),
      });
      const task = await res.json();
      if (!res.ok || !task.id) throw new Error("Failed to create task");

      const uploads: Promise<unknown>[] = [];

      if (pendingVoice) {
        uploads.push(
          new Promise<void>((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(pendingVoice.blob);
            reader.onloadend = () => {
              fetch("/api/voice-notes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  url: reader.result,
                  taskId: task.id,
                  duration: pendingVoice.duration,
                }),
              })
                .then(() => resolve())
                .catch(reject);
            };
          })
        );
      }

      for (const { file } of pendingFiles) {
        uploads.push(
          new Promise<void>((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onloadend = () => {
              fetch("/api/attachments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  url: reader.result,
                  fileName: file.name,
                  taskId: task.id,
                }),
              })
                .then(() => resolve())
                .catch(reject);
            };
          })
        );
      }

      await Promise.all(uploads);
      await fetchClient();
      setNewTaskTitle("");
      setNewTaskDesc("");
      setNewTaskDueDate("");
      setNewTaskPriority("MEDIUM");
      setPendingVoice(null);
      setPendingFiles([]);
      setShowAddTask(false);
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
    if (selectedTask) {
      setSubmitting(true);
      try {
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = async () => {
          const res = await fetch("/api/voice-notes", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              url: reader.result,
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
    } else {
      // In add task form - store for submit
      setPendingVoice({ blob, duration });
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setPendingFiles((prev) => [
      ...prev,
      ...files.map((f) => ({
        file: f,
        preview: f.type.startsWith("image/") ? URL.createObjectURL(f) : undefined,
      })),
    ]);
    e.target.value = "";
  };

  const removePendingFile = (i: number) => {
    setPendingFiles((prev) => {
      const p = prev[i];
      if (p?.preview) URL.revokeObjectURL(p.preview);
      return prev.filter((_, idx) => idx !== i);
    });
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
            <h1 className="text-base font-semibold text-slate-900">Task Portal</h1>
            <p className="text-xs text-slate-500">Assign tasks and track progress</p>
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
            <CardHeader className="border-b border-slate-100 pb-4">
              <CardTitle className="text-base font-medium">New Task</CardTitle>
              <p className="text-xs text-slate-500">Add task name, description, voice note, and files</p>
            </CardHeader>
            <CardContent className="pt-4">
              <form onSubmit={createTask} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Task name *</label>
                  <Input
                    placeholder="Task name or type '/' for commands"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Description</label>
                  <Textarea
                    placeholder="Add description"
                    value={newTaskDesc}
                    onChange={(e) => setNewTaskDesc(e.target.value)}
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">Due date</label>
                    <Input
                      type="date"
                      value={newTaskDueDate}
                      onChange={(e) => setNewTaskDueDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">Priority</label>
                    <select
                      value={newTaskPriority}
                      onChange={(e) => setNewTaskPriority(e.target.value)}
                      className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300"
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                      <option value="URGENT">Urgent</option>
                    </select>
                  </div>
                </div>

                {/* Voice & File in Add Task form */}
                <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50/50 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700">Voice note</span>
                    <VoiceRecorder
                      onRecorded={handleVoiceNote}
                      disabled={submitting}
                    />
                  </div>
                  {pendingVoice && (
                    <p className="text-xs text-emerald-600">
                      Voice note ready · Release mic or record again to replace
                    </p>
                  )}
                  <p className="text-xs text-slate-500">Hold mic button to record</p>

                  <div className="border-t border-slate-200 pt-3">
                    <span className="mb-2 block text-sm font-medium text-slate-700">Upload files</span>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      className="hidden"
                      onChange={handleFileSelect}
                      accept="image/*,.pdf,.doc,.docx,.txt,.csv,.xlsx"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-200 bg-white py-6 text-sm text-slate-500 transition-colors hover:border-violet-300 hover:bg-violet-50/50 hover:text-violet-600"
                    >
                      <Paperclip className="h-5 w-5" />
                      Upload file here — images, PDF, docs, etc.
                    </button>
                    {pendingFiles.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {pendingFiles.map((pf, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-1 rounded-md bg-white px-2 py-1.5 text-xs shadow-sm"
                          >
                            {pf.preview ? (
                              <img src={pf.preview} alt="" className="h-6 w-6 rounded object-cover" />
                            ) : (
                              <FileText className="h-4 w-4 text-slate-400" />
                            )}
                            <span className="max-w-[120px] truncate">{pf.file.name}</span>
                            <button
                              type="button"
                              onClick={() => removePendingFile(i)}
                              className="rounded p-0.5 hover:bg-slate-100"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button type="submit" disabled={submitting}>
                    {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Task"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowAddTask(false);
                      setNewTaskTitle("");
                      setNewTaskDesc("");
                      setNewTaskDueDate("");
                      setNewTaskPriority("MEDIUM");
                      setPendingVoice(null);
                      setPendingFiles((prev) => {
                        prev.forEach((p) => p.preview && URL.revokeObjectURL(p.preview));
                        return [];
                      });
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
              <p className="text-slate-500">No tasks yet. Add your first task to get started.</p>
              <Button className="mt-4 gap-2" size="sm" onClick={() => setShowAddTask(true)}>
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
                    <span className="flex items-center gap-1">
                      <Paperclip className="h-3.5 w-3.5" />
                      {task.attachments?.length ?? 0}
                    </span>
                  </div>
                </CardHeader>

                {selectedTask?.id === task.id && (
                  <CardContent className="border-t border-slate-100 bg-slate-50/50 pt-4">
                    <h4 className="mb-3 text-xs font-medium text-slate-600">Comments & attachments</h4>
                    <div className="mb-4 max-h-40 space-y-2 overflow-y-auto">
                      {task.comments.map((c) => (
                        <div key={c.id} className="rounded-lg bg-white p-2.5 text-sm shadow-sm">
                          <p className="text-slate-700">{c.content}</p>
                          <p className="mt-1 text-xs text-slate-400">
                            {c.author} · {new Date(c.createdAt).toLocaleString()}
                          </p>
                        </div>
                      ))}
                      {task.voiceNotes.map((v) => (
                        <div key={v.id} className="flex items-center gap-2 rounded-lg bg-white p-2.5 shadow-sm">
                          <Play className="h-4 w-4 shrink-0 text-violet-500" />
                          <audio src={v.url} controls className="h-8 flex-1" />
                          <span className="text-xs text-slate-400">{v.duration}s</span>
                        </div>
                      ))}
                      {task.attachments?.map((a) => (
                        <div key={a.id} className="flex items-center gap-2 rounded-lg bg-white p-2.5 shadow-sm">
                          {a.url.startsWith("data:image/") ? (
                            <a href={a.url} target="_blank" rel="noopener noreferrer" className="block">
                              <img src={a.url} alt={a.fileName} className="h-16 w-16 rounded object-cover" />
                            </a>
                          ) : (
                            <FileText className="h-8 w-8 text-slate-400" />
                          )}
                          <a
                            href={a.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-violet-600 hover:underline"
                          >
                            {a.fileName}
                          </a>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white p-2">
                      <input
                        ref={fileInputRefComment}
                        type="file"
                        multiple
                        className="hidden"
                        onChange={(e) => {
                          const files = Array.from(e.target.files || []);
                          if (!selectedTask) return;
                          files.forEach((file) => {
                            const reader = new FileReader();
                            reader.readAsDataURL(file);
                            reader.onloadend = async () => {
                              setSubmitting(true);
                              try {
                                const res = await fetch("/api/attachments", {
                                  method: "POST",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({
                                    url: reader.result,
                                    fileName: file.name,
                                    taskId: selectedTask.id,
                                  }),
                                });
                                if (res.ok) {
                                  const updated = await fetchClient();
                                  if (updated) {
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
                          });
                          e.target.value = "";
                        }}
                        accept="image/*,.pdf,.doc,.docx,.txt,.csv,.xlsx"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRefComment.current?.click()}
                        disabled={submitting}
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                        title="Upload file"
                      >
                        <Paperclip className="h-5 w-5" />
                      </button>
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
                      Hold mic to record voice note
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
