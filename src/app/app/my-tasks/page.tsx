"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CheckSquare } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<string, string> = {
  TODO: "bg-slate-100 text-slate-700",
  IN_PROGRESS: "bg-violet-100 text-violet-700",
  Blocked: "bg-amber-100 text-amber-700",
  Done: "bg-emerald-100 text-emerald-700",
  DONE: "bg-emerald-100 text-emerald-700",
};

type Task = {
  id: string;
  shortCode?: string | null;
  title: string;
  status: string;
  assignee: string | null;
  dueDate: string | null;
};

export default function MyTasksPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const team = JSON.parse(localStorage.getItem("flux_team") || "{}");
    if (!team?.id) {
      setLoading(false);
      return;
    }
    fetch(`/api/teams/${team.id}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((t) => setTasks(t?.tasks ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const user = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("flux_user") || "{}") : {};
  const myTasks = tasks.filter((t) => t.assignee === user.email);

  return (
    <div className="p-6">
      <h1 className="mb-6 text-xl font-semibold text-slate-900">My Tasks</h1>
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        </div>
      ) : myTasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 py-16">
          <CheckSquare className="mb-4 h-14 w-14 text-slate-300" />
          <p className="text-slate-500">No tasks assigned to you</p>
        </div>
      ) : (
        <div className="space-y-2">
          {myTasks.map((task) => (
            <Card
              key={task.id}
              className="cursor-pointer border-slate-200 transition-colors hover:bg-slate-50"
              onClick={() => router.push(`/app/tasks?task=${task.id}`)}
            >
              <CardHeader className="flex flex-row items-center justify-between py-3">
                <div>
                  <p className="font-medium text-slate-900">{task.title}</p>
                  <p className="text-xs text-slate-500">
                    {[task.shortCode, task.dueDate && `Due ${new Date(task.dueDate).toLocaleDateString()}`]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>
                <span
                  className={cn(
                    "rounded-md px-2 py-0.5 text-xs font-medium",
                    STATUS_STYLES[task.status] ?? STATUS_STYLES.TODO
                  )}
                >
                  {task.status.replace("_", " ")}
                </span>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
