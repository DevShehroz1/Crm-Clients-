"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Loader2, LayoutList, MoreVertical, BarChart2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const STATUS_ORDER = ["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"] as const;

const STATUS_CONFIG: Record<string, { label: string; pillClass: string; iconClass: string }> = {
  TODO: {
    label: "To Do",
    pillClass: "bg-slate-100 text-slate-700 border-slate-200",
    iconClass: "border-slate-400 bg-slate-200",
  },
  IN_PROGRESS: {
    label: "In Progress",
    pillClass: "bg-violet-100 text-violet-800 border-violet-200",
    iconClass: "border-violet-500 bg-violet-400",
  },
  IN_REVIEW: {
    label: "In Review",
    pillClass: "bg-amber-100 text-amber-800 border-amber-200",
    iconClass: "border-amber-500 bg-amber-400",
  },
  DONE: {
    label: "Done",
    pillClass: "bg-emerald-100 text-emerald-800 border-emerald-200",
    iconClass: "border-emerald-500 bg-emerald-400",
  },
};

const PRIORITY_LABELS: Record<string, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  URGENT: "Urgent",
};

type Client = {
  id: string;
  name: string;
  company: string | null;
  slug: string;
  tasks: {
    id: string;
    title: string;
    description: string | null;
    status: string;
    priority?: string;
    dueDate?: string | null;
  }[];
};

export default function ManageClientPage() {
  const params = useParams();
  const clientId = params.clientId as string;
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [hideClosed, setHideClosed] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/clients");
        if (res.ok) {
          const clients: Client[] = await res.json();
          const c = clients.find((x) => x.id === clientId);
          if (c) setClient(c);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [clientId]);

  const updateTaskStatus = async (taskId: string, status: string) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok && client) {
        setClient({
          ...client,
          tasks: client.tasks.map((t) =>
            t.id === taskId ? { ...t, status } : t
          ),
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-white">
        <p className="text-slate-500">Client not found</p>
        <Link href="/">
          <Button variant="outline">Back to Dashboard</Button>
        </Link>
      </div>
    );
  }

  const tasksByStatus = STATUS_ORDER.reduce((acc, status) => {
    acc[status] = client.tasks.filter((t) => t.status === status);
    return acc;
  }, {} as Record<string, Client["tasks"]>);

  const displayStatuses = hideClosed
    ? STATUS_ORDER.filter((s) => s !== "DONE")
    : STATUS_ORDER;

  const doneCount = client.tasks.filter((t) => t.status === "DONE").length;
  const total = client.tasks.length;
  const progress = total > 0 ? Math.round((doneCount / total) * 100) : 0;

  const formatDate = (d: string | null | undefined) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-US", {
      month: "numeric",
      day: "numeric",
      year: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          <div className="text-center">
            <h1 className="font-semibold text-slate-900">{client.name}</h1>
            {client.company && (
              <p className="text-sm text-slate-500">{client.company}</p>
            )}
          </div>
          <a
            href={`/client/${client.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-slate-600 hover:text-slate-900 hover:underline"
          >
            View portal
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-6">
        {/* Progress card */}
        <div className="mb-6 rounded-lg border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-700">Progress</p>
              <p className="text-sm text-slate-500">
                {doneCount} of {total} tasks completed
              </p>
            </div>
            <div className="h-2 w-32 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-violet-500 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Toolbar - ClickUp style */}
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1">
            <button
              type="button"
              className="flex items-center gap-2 rounded-lg border border-violet-200 bg-violet-50 px-3 py-1.5 text-sm font-medium text-violet-700"
            >
              <LayoutList className="h-4 w-4" />
              Group: Status
            </button>
          </div>
          <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={hideClosed}
              onChange={(e) => setHideClosed(e.target.checked)}
              className="rounded"
            />
            Hide closed
          </label>
        </div>

        {client.tasks.length === 0 ? (
          <div className="rounded-lg border-2 border-dashed border-slate-200 bg-white py-16 text-center text-slate-500">
            No tasks yet. Client can add tasks from their portal.
          </div>
        ) : (
          <div className="space-y-8">
            {displayStatuses.map((status) => {
              const tasks = tasksByStatus[status] || [];
              if (tasks.length === 0) return null;

              const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.TODO;

              return (
                <div
                  key={status}
                  className="rounded-lg border border-slate-200 bg-white"
                >
                  {/* Group header */}
                  <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span
                        className={cn(
                          "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-medium",
                          config.pillClass
                        )}
                      >
                        <span
                          className={cn(
                            "h-2 w-2 rounded-full border",
                            config.iconClass
                          )}
                        />
                        {config.label}
                      </span>
                      <span className="text-sm text-slate-500">
                        {tasks.length}
                      </span>
                    </div>
                    <button
                      type="button"
                      className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Column headers */}
                  <div className="grid grid-cols-[1fr_130px_90px_110px] gap-4 border-b border-slate-100 bg-slate-50/50 px-4 py-2 text-xs font-medium uppercase tracking-wider text-slate-500">
                    <span>Name</span>
                    <span>Status</span>
                    <span>Priority</span>
                    <span>Due date</span>
                  </div>

                  {/* Task rows */}
                  <div className="divide-y divide-slate-100">
                    {tasks.map((task) => (
                      <div
                        key={task.id}
                        className="grid grid-cols-[1fr_130px_90px_110px] items-center gap-4 px-4 py-3 transition-colors hover:bg-slate-50/50"
                      >
                        <div className="flex min-w-0 items-center gap-2">
                          <BarChart2 className="h-4 w-4 shrink-0 text-slate-400" />
                          <span className="truncate text-sm font-medium text-slate-900">
                            {task.title}
                          </span>
                        </div>
                        <select
                          value={task.status}
                          onChange={(e) =>
                            updateTaskStatus(task.id, e.target.value)
                          }
                          className={cn(
                            "rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs font-medium text-slate-700",
                            "focus:outline-none focus:ring-2 focus:ring-violet-200"
                          )}
                        >
                          {(Object.keys(STATUS_CONFIG) as (keyof typeof STATUS_CONFIG)[]).map(
                            (s) => (
                              <option key={s} value={s}>
                                {STATUS_CONFIG[s].label}
                              </option>
                            )
                          )}
                        </select>
                        <span className="text-sm text-slate-600">
                          {PRIORITY_LABELS[task.priority || "MEDIUM"]}
                        </span>
                        <span className="text-sm text-slate-600">
                          {formatDate(task.dueDate)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
