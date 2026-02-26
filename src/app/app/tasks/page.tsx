"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Loader2,
  Plus,
  BarChart2,
  LayoutGrid,
  List,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TaskModal } from "@/components/task-modal";
import { TaskDrawer } from "@/components/task-drawer";
import { QuickAdd } from "@/components/quick-add";
import { cn } from "@/lib/utils";

const STATUS_ORDER = ["Backlog", "TODO", "IN_PROGRESS", "Blocked", "Done"];
const STATUS_STYLES: Record<string, string> = {
  Backlog: "bg-slate-100 text-slate-600",
  TODO: "bg-slate-100 text-slate-700",
  IN_PROGRESS: "bg-violet-100 text-violet-700",
  Blocked: "bg-amber-100 text-amber-700",
  Done: "bg-emerald-100 text-emerald-700",
};

type Task = {
  id: string;
  shortCode?: string | null;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  assignee: string | null;
  dueDate: string | null;
  channelId?: string | null;
};

type Workspace = {
  id: string;
  name: string;
  tasks: Task[];
  members: { id: string; email: string; name: string | null }[];
  channels: { id: string; name: string }[];
};

function BoardColumn({
  status,
  tasks,
  onTaskClick,
  onDrop,
}: {
  status: string;
  tasks: Task[];
  onTaskClick: (t: Task) => void;
  onDrop: (taskId: string, newStatus: string) => void;
}) {
  const [over, setOver] = useState(false);

  return (
    <div
      className={cn(
        "min-w-[280px] flex-1 rounded-lg border bg-white transition-colors",
        over ? "border-violet-300 bg-violet-50/50" : "border-slate-200"
      )}
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        const taskId = e.dataTransfer.getData("taskId");
        if (taskId) onDrop(taskId, status);
      }}
    >
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <span
          className={cn(
            "rounded-full px-3 py-1 text-sm font-medium",
            STATUS_STYLES[status] || STATUS_STYLES.TODO
          )}
        >
          {status.replace("_", " ")}
        </span>
        <span className="text-sm text-slate-500">{tasks.length}</span>
      </div>
      <div className="space-y-2 p-3">
        {tasks.map((task) => (
          <Card
            key={task.id}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData("taskId", task.id);
              e.dataTransfer.effectAllowed = "move";
            }}
            className="cursor-grab border-slate-200 transition-shadow hover:shadow-md active:cursor-grabbing"
          >
            <CardContent
              className="flex items-center justify-between py-3"
              onClick={() => onTaskClick(task)}
            >
              <div>
                <p className="font-medium text-slate-900">{task.title}</p>
                <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                  {task.shortCode && (
                    <span className="font-mono">{task.shortCode}</span>
                  )}
                  {task.assignee && (
                    <span>→ {task.assignee}</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function TasksContent() {
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [loading, setLoading] = useState(true);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [drawerTaskId, setDrawerTaskId] = useState<string | null>(null);
  const [view, setView] = useState<"board" | "list">("board");

  const workspaceId =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("flux_team") || "{}")?.id
      : null;

  const fetchWorkspace = () => {
    if (!workspaceId) return;
    fetch(`/api/teams/${workspaceId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then(setWorkspace)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchWorkspace();
  }, [workspaceId]);

  const searchParams = useSearchParams();
  useEffect(() => {
    if (searchParams.get("new") === "1") setTaskModalOpen(true);
    const task = searchParams.get("task");
    if (task) setDrawerTaskId(task);
  }, [searchParams]);

  const tasksByStatus = STATUS_ORDER.reduce(
    (acc, s) => {
      const aliases: Record<string, string[]> = {
        Done: ["Done", "DONE"],
        TODO: ["TODO", "Todo"],
      };
      const matches = aliases[s] || [s];
      acc[s] = (workspace?.tasks ?? []).filter((t) => matches.includes(t.status) || t.status === s);
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
      fetchWorkspace();
    } catch (err) {
      console.error(err);
    }
  };

  const onTaskSaved = () => {
    setTaskModalOpen(false);
    setEditingTask(null);
    fetchWorkspace();
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  const members = workspace?.members ?? [];
  const channels = workspace?.channels ?? [];

  return (
    <div className="p-6">
      <QuickAdd
        workspaceId={workspaceId}
        channelId={channels[0]?.id}
        onCreated={fetchWorkspace}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold text-slate-900">Tasks</h1>
          <div className="flex rounded-lg border border-slate-200 p-1">
            <button
              type="button"
              onClick={() => setView("board")}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                view === "board" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
              )}
            >
              <LayoutGrid className="inline h-4 w-4" /> Board
            </button>
            <button
              type="button"
              onClick={() => setView("list")}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                view === "list" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
              )}
            >
              <List className="inline h-4 w-4" /> List
            </button>
          </div>
        </div>
        <Button
          onClick={() => {
            setEditingTask(null);
            setTaskModalOpen(true);
          }}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          New Task
        </Button>
      </div>

      {!workspace?.tasks?.length ? (
        <Card className="border-dashed border-2 border-slate-200">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <BarChart2 className="mb-4 h-14 w-14 text-slate-300" />
            <p className="text-slate-500">No tasks yet. Create your first task.</p>
            <p className="mt-1 text-sm text-slate-400">
              Press <kbd className="rounded bg-slate-200 px-1.5 py-0.5 text-xs">⌘K</kbd> to quick add
            </p>
            <Button className="mt-4 gap-2" onClick={() => setTaskModalOpen(true)}>
              <Plus className="h-4 w-4" />
              New Task
            </Button>
          </CardContent>
        </Card>
      ) : view === "board" ? (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {STATUS_ORDER.map((status) => (
            <BoardColumn
              key={status}
              status={status}
              tasks={tasksByStatus[status] ?? []}
              onTaskClick={(t) => setDrawerTaskId(t.id)}
              onDrop={updateTaskStatus}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {workspace.tasks.map((task) => (
            <Card
              key={task.id}
              className="cursor-pointer border-slate-200 transition-colors hover:bg-slate-50"
              onClick={() => setDrawerTaskId(task.id)}
            >
              <CardContent className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium text-slate-900">{task.title}</p>
                  <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                    {task.shortCode && (
                      <span className="font-mono">{task.shortCode}</span>
                    )}
                    {task.assignee && <span>→ {task.assignee}</span>}
                  </div>
                </div>
                <span
                  className={cn(
                    "rounded-full px-2.5 py-0.5 text-xs font-medium",
                    STATUS_STYLES[task.status] || STATUS_STYLES.TODO
                  )}
                >
                  {task.status.replace("_", " ")}
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {taskModalOpen && workspaceId && (
        <TaskModal
          teamId={workspaceId}
          members={members}
          task={editingTask}
          onClose={() => {
            setTaskModalOpen(false);
            setEditingTask(null);
          }}
          onSaved={onTaskSaved}
        />
      )}

      {drawerTaskId && workspaceId && (
        <TaskDrawer
          taskId={drawerTaskId}
          workspaceId={workspaceId}
          members={members}
          onClose={() => setDrawerTaskId(null)}
          onUpdated={fetchWorkspace}
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
