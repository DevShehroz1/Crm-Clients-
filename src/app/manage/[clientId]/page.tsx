"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const STATUS_LABELS: Record<string, string> = {
  TODO: "To Do",
  IN_PROGRESS: "In Progress",
  IN_REVIEW: "In Review",
  DONE: "Done",
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
    comments: unknown[];
    voiceNotes: unknown[];
  }[];
};

export default function ManageClientPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params.clientId as string;
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);

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
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 dark:bg-slate-950">
        <p className="text-slate-500">Client not found</p>
        <Link href="/">
          <Button variant="outline">Back to Dashboard</Button>
        </Link>
      </div>
    );
  }

  const todoCount = client.tasks.filter((t) => t.status === "TODO").length;
  const doneCount = client.tasks.filter((t) => t.status === "DONE").length;
  const total = client.tasks.length;
  const progress = total > 0 ? Math.round((doneCount / total) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/80">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-50">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          <div>
            <h1 className="font-semibold text-slate-900 dark:text-slate-50">
              {client.name}
            </h1>
            {client.company && (
              <p className="text-sm text-slate-500">{client.company}</p>
            )}
          </div>
          <a
            href={`/client/${client.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-slate-600 hover:underline dark:text-slate-400"
          >
            View client portal
          </a>
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

        <h2 className="mb-4 text-lg font-semibold">Tasks</h2>

        {client.tasks.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center text-slate-500">
              No tasks yet. Client can add tasks from their portal.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {client.tasks.map((task) => (
              <Card key={task.id} className="overflow-hidden">
                <CardHeader className="flex flex-row items-start justify-between gap-4 py-4">
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-base font-medium">
                      {task.title}
                    </CardTitle>
                    {task.description && (
                      <p className="mt-1 text-sm text-slate-500 line-clamp-2">
                        {task.description}
                      </p>
                    )}
                  </div>
                  <select
                    value={task.status}
                    onChange={(e) =>
                      updateTaskStatus(task.id, e.target.value)
                    }
                    className={cn(
                      "shrink-0 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium",
                      "focus:outline-none focus:ring-2 focus:ring-slate-400 dark:border-slate-700 dark:bg-slate-900"
                    )}
                  >
                    {(Object.keys(STATUS_LABELS) as (keyof typeof STATUS_LABELS)[]).map((s) => (
                      <option key={s} value={s}>
                        {STATUS_LABELS[s]}
                      </option>
                    ))}
                  </select>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
