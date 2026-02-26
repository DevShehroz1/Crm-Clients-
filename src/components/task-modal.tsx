"use client";

import { useState, useRef } from "react";
import { X, FileText, Paperclip, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { VoiceRecorder } from "@/components/voice-recorder";

type Task = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  assignee: string | null;
  dueDate: string | null;
};

type Member = { email: string; name: string | null };

type PendingFile = { file: File; preview?: string };

export function TaskModal({
  teamId,
  members,
  task,
  onClose,
  onSaved,
}: {
  teamId: string;
  members: Member[];
  task: Task | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [title, setTitle] = useState(task?.title ?? "");
  const [description, setDescription] = useState(task?.description ?? "");
  const [status, setStatus] = useState(task?.status ?? "TODO");
  const [priority, setPriority] = useState(task?.priority ?? "MEDIUM");
  const [assignee, setAssignee] = useState(task?.assignee ?? "");
  const [dueDate, setDueDate] = useState(
    task?.dueDate ? new Date(task.dueDate).toISOString().slice(0, 10) : ""
  );
  const [pendingVoice, setPendingVoice] = useState<{ blob: Blob; duration: number } | null>(null);
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleVoiceNote = (blob: Blob, duration: number) => {
    setPendingVoice({ blob, duration });
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

  const removeFile = (i: number) => {
    setPendingFiles((prev) => {
      const p = prev[i];
      if (p?.preview) URL.revokeObjectURL(p.preview);
      return prev.filter((_, idx) => idx !== i);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    try {
      if (task?.id) {
        await fetch(`/api/tasks/${task.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: title.trim(),
            description: description.trim() || null,
            status,
            priority,
            assignee: assignee || null,
            dueDate: dueDate || null,
          }),
        });
      } else {
        const res = await fetch("/api/tasks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: title.trim(),
            description: description.trim() || null,
            workspaceId: teamId,
            status,
            priority,
            assignee: assignee || null,
            dueDate: dueDate || null,
          }),
        });
        const newTask = await res.json();
        if (!res.ok) throw new Error(newTask.error);

        const uploads: Promise<unknown>[] = [];
        if (pendingVoice) {
          uploads.push(
            new Promise<void>((resolve, reject) => {
              const reader = new FileReader();
              reader.readAsDataURL(pendingVoice.blob);
              reader.onloadend = () =>
                fetch("/api/voice-notes", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    url: reader.result,
                    taskId: newTask.id,
                    duration: pendingVoice.duration,
                  }),
                })
                  .then(() => resolve())
                  .catch(reject);
            })
          );
        }
        for (const { file } of pendingFiles) {
          uploads.push(
            new Promise<void>((resolve, reject) => {
              const reader = new FileReader();
              reader.readAsDataURL(file);
              reader.onloadend = () =>
                fetch("/api/attachments", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    url: reader.result,
                    fileName: file.name,
                    taskId: newTask.id,
                  }),
                })
                  .then(() => resolve())
                  .catch(reject);
            })
          );
        }
        await Promise.all(uploads);
      }
      onSaved();
    } catch (err) {
      console.error(err);
      alert("Failed to save task");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 transition-opacity duration-[120ms]" onClick={onClose} />
      <div className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-xl motion-modal-scale-in">
        <div className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900">{task ? "Edit Task" : "New Task"}</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Task name</label>
            <Input
              placeholder="Task name or type '/' for commands"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Description</label>
            <Textarea
              placeholder="Add description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="flex h-10 w-full rounded-lg border border-slate-200 px-3 text-sm"
              >
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="IN_REVIEW">In Review</option>
                <option value="DONE">Done</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Assignee</label>
              <select
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
                className="flex h-10 w-full rounded-lg border border-slate-200 px-3 text-sm"
              >
                <option value="">Unassigned</option>
                {members.map((m) => (
                  <option key={m.email} value={m.email}>
                    {m.name || m.email}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Due date</label>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="flex h-10 w-full rounded-lg border border-slate-200 px-3 text-sm"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
          </div>
          {!task && (
            <>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Voice note</label>
                <VoiceRecorder onRecorded={handleVoiceNote} disabled={saving} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Attachments</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleFileSelect}
                  accept="image/*,.pdf,.doc,.docx"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-200 py-6 text-sm text-slate-500 hover:border-violet-300 hover:text-violet-600"
                >
                  <Paperclip className="h-5 w-5" />
                  Upload file
                </button>
                {pendingFiles.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {pendingFiles.map((pf, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 rounded-md bg-slate-100 px-2 py-1 text-xs"
                      >
                        {pf.preview ? (
                          <img src={pf.preview} alt="" className="h-6 w-6 rounded object-cover" />
                        ) : (
                          <FileText className="h-4 w-4" />
                        )}
                        <span className="max-w-[100px] truncate">{pf.file.name}</span>
                        <button type="button" onClick={() => removeFile(i)}>×</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : task ? "Save" : "Create Task"}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
