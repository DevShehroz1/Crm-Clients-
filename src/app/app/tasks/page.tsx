"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2, Plus, MoreVertical, BarChart2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { TaskModal } from "@/components/task-modal";
import { cn } from "@/lib/utils";

const STATUS_ORDER = ["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"] as const;
const STATUS_STYLES: Record<string, string> = {
  TODO: "bg-slate-100 text-slate-700",
  IN_PROGRESS: "bg-violet-100 text-violet-700",
  IN_REVIEW: "bg-amber-100 text-amber-700",
  DONE: "bg-emerald-100 text-emerald-700",
};

type Task = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  assignee: string | null;
  dueDate: string | null;
};

type Team = {
  id: string;
  name: string;
  tasks: Task[];
  members: { email: string; name: string | null }[];
};

function TasksContent() {
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const teamId = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("flux_team") || "{}")?.id : null;

  const fetchTeam = () => {
    if (!teamId) return;
    fetch(`/api/teams/${teamId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then(setTeam)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTeam();
  }, [teamId]);

  const searchParams = useSearchParams();
  useEffect(() => {
    if (searchParams.get("new") === "1") setTaskModalOpen(true);
  }, [searchParams]);

  const tasksByStatus = STATUS_ORDER.reduce(
    (acc, s) => {
      acc[s] = (team?.tasks ?? []).filter((t) => t.status === s);
      return acc;
    },
    {} as Record<string, Task[]>
  );

  const updateTaskStatus = async (taskId: string, status: string) => {
    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      fetchTeam();
    } catch (err) {
      console.error(err);
    }
  };

  const onTaskSaved = () => {
    setTaskModalOpen(false);
    setEditingTask(null);
    fetchTeam();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900">All Tasks</h1>
        <Button onClick={() => { setEditingTask(null); setTaskModalOpen(true); }} className="gap-2">
          <Plus className="h-4 w-4" />
          New Task
        </Button>
      </div>

      {!team?.tasks?.length ? (
        <Card className="border-dashed border-2 border-slate-200">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <BarChart2 className="mb-4 h-14 w-14 text-slate-300" />
            <p className="text-slate-500">No tasks yet. Create your first task.</p>
            <Button className="mt-4 gap-2" onClick={() => setTaskModalOpen(true)}>
              <Plus className="h-4 w-4" />
              New Task
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="flex gap-6 overflow-x-auto">
          {STATUS_ORDER.map((status) => {
            const tasks = tasksByStatus[status] ?? [];
            return (
              <div
                key={status}
                className="min-w-[280px] rounded-lg border border-slate-200 bg-white"
              >
                <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                  <span className={cn("rounded-full px-3 py-1 text-sm font-medium", STATUS_STYLES[status])}>
                    {status.replace("_", " ")}
                  </span>
                  <span className="text-sm text-slate-500">{tasks.length}</span>
                </div>
                <div className="space-y-2 p-3">
                  {tasks.map((task) => (
                    <Card
                      key={task.id}
                      className="cursor-pointer border-slate-200 transition-colors hover:bg-slate-50"
                      onClick={() => { setEditingTask(task); setTaskModalOpen(true); }}
                    >
                      <CardContent className="flex items-center justify-between py-3">
                        <div>
                          <p className="font-medium text-slate-900">{task.title}</p>
                          {task.assignee && (
                            <p className="text-xs text-slate-500">→ {task.assignee}</p>
                          )}
                        </div>
                        <select
                          value={task.status}
                          onChange={(e) => { e.stopPropagation(); updateTaskStatus(task.id, e.target.value); }}
                          onClick={(e) => e.stopPropagation()}
                          className="rounded border border-slate-200 px-2 py-1 text-xs"
                        >
                          {STATUS_ORDER.map((s) => (
                            <option key={s} value={s}>{s.replace("_", " ")}</option>
                          ))}
                        </select>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {taskModalOpen && teamId && (
        <TaskModal
          teamId={teamId}
          members={team?.members ?? []}
          task={editingTask}
          onClose={() => { setTaskModalOpen(false); setEditingTask(null); }}
          onSaved={onTaskSaved}
        />
      )}
    </div>
  );
}

export default function TasksPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <TasksContent />
    </Suspense>
  );
}
