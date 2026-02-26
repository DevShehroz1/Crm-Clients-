"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, CheckSquare } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<string, string> = {
  TODO: "bg-slate-100 text-slate-700",
  IN_PROGRESS: "bg-violet-100 text-violet-700",
  IN_REVIEW: "bg-amber-100 text-amber-700",
  DONE: "bg-emerald-100 text-emerald-700",
};

type Client = {
  id: string;
  name: string;
  tasks: { id: string; title: string; status: string; clientId: string }[];
};

export default function MyTasksPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/clients")
      .then((r) => r.ok ? r.json() : [])
      .then(setClients)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const allTasks = clients.flatMap((c) =>
    c.tasks.map((t) => ({ ...t, clientName: c.name }))
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="mb-6 text-xl font-semibold text-slate-900">My Tasks</h1>
      {allTasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 py-16">
          <CheckSquare className="mb-4 h-14 w-14 text-slate-300" />
          <p className="text-slate-500">No tasks assigned yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {allTasks.map((task) => (
            <Link key={task.id} href={`/manage/${task.clientId}`}>
              <Card
                className={cn(
                  "cursor-pointer border-slate-200 transition-colors hover:bg-slate-50"
                )}
              >
                <CardHeader className="flex flex-row items-center justify-between py-3">
                  <div>
                    <p className="font-medium text-slate-900">{task.title}</p>
                    <p className="text-sm text-slate-500">{task.clientName}</p>
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
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
