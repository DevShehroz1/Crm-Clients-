"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Users, Loader2, ArrowLeft, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type Team = {
  id: string;
  name: string;
  createdAt: string;
  _count?: { members: number; tasks: number; channels: number };
};

function OwnerContent() {
  const searchParams = useSearchParams();
  const keyParam = searchParams.get("key");
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [keyInput, setKeyInput] = useState(keyParam || "");
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    const verify = async () => {
      const keyToCheck = keyParam || keyInput;
      if (!keyToCheck) {
        setAuthorized(false);
        setLoading(false);
        return;
      }
      const res = await fetch(`/api/owner/verify?key=${encodeURIComponent(keyToCheck)}`);
      const data = await res.json();
      if (data.ok) {
        setAuthorized(true);
        fetch("/api/teams")
          .then((r) => (r.ok ? r.json() : []))
          .then(setTeams)
          .catch(console.error)
          .finally(() => setLoading(false));
      } else {
        setAuthorized(false);
        setLoading(false);
      }
    };

    if (keyParam) {
      verify();
    } else {
      setAuthorized(false);
      setLoading(false);
    }
  }, [keyParam]);

  const handleKeySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyInput.trim()) return;
    setChecking(true);
    const res = await fetch(`/api/owner/verify?key=${encodeURIComponent(keyInput.trim())}`);
    const data = await res.json();
    setChecking(false);
    if (data.ok) {
      window.location.href = `/owner?key=${encodeURIComponent(keyInput.trim())}`;
    } else {
      setAuthorized(false);
    }
  };

  if (authorized === false && !keyParam) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
            <Lock className="h-6 w-6" />
          </div>
          <h1 className="mt-4 text-xl font-bold text-slate-900">Owner Access</h1>
          <p className="mt-2 text-sm text-slate-600">
            Enter your owner key to access the dashboard.
          </p>
          <form onSubmit={handleKeySubmit} className="mt-6">
            <Input
              type="password"
              placeholder="Owner key"
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              className="mb-4"
            />
            <Button type="submit" className="w-full" disabled={checking}>
              {checking ? <Loader2 className="h-5 w-5 animate-spin" /> : "Access Dashboard"}
            </Button>
          </form>
          <Link href="/" className="mt-4 flex justify-center text-sm text-slate-500 hover:text-slate-700">
            ← Back to Flux CRM
          </Link>
        </div>
      </div>
    );
  }

  if (!authorized && keyParam) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <Lock className="mx-auto h-12 w-12 text-slate-400" />
          <h2 className="mt-4 text-lg font-semibold text-slate-900">Access denied</h2>
          <p className="mt-2 text-slate-600">Invalid owner key.</p>
          <Link href="/owner" className="mt-4 inline-block text-sm text-violet-600 hover:underline">
            Try again
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900">
            <ArrowLeft className="h-4 w-4" />
            Back to Flux CRM
          </Link>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600 text-white font-bold text-sm">
              F
            </div>
            <span className="font-semibold text-slate-900">Owner Dashboard</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Flux CRM</h1>
          <p className="text-slate-600">Overview of teams using your product</p>
        </div>

        <Card className="mb-8 border-slate-200">
          <CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-violet-100">
                  <Users className="h-7 w-7 text-violet-600" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-slate-900">{teams.length}</p>
                  <p className="text-sm text-slate-500">Teams using Flux CRM</p>
                </div>
              </div>
            </CardContent>
          </CardHeader>
        </Card>

        <h2 className="mb-4 text-lg font-semibold text-slate-900">Teams</h2>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
          </div>
        ) : teams.length === 0 ? (
          <Card className="border-dashed border-2 border-slate-200">
            <CardContent className="py-12 text-center text-slate-500">
              <Users className="mx-auto mb-4 h-12 w-12 text-slate-300" />
              <p>No teams yet. Teams are created when customers sign up.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {teams.map((team) => (
              <Card key={team.id} className="border-slate-200">
                <CardContent className="flex flex-row items-center justify-between py-4">
                  <div>
                    <p className="font-medium text-slate-900">{team.name}</p>
                    <p className="text-sm text-slate-500">
                      Created {new Date(team.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-slate-500">
                    <span>{team._count?.members ?? 0} members</span>
                    <span>{team._count?.tasks ?? 0} tasks</span>
                    <span>{team._count?.channels ?? 0} channels</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default function OwnerDashboardPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-600 border-t-transparent" /></div>}>
      <OwnerContent />
    </Suspense>
  );
}
