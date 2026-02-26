"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Loader2, Users, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function JoinInvitePage() {
  const router = useRouter();
  const params = useParams();
  const token = params?.token as string;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [invite, setInvite] = useState<{ email: string; teamName: string } | null>(null);
  const [name, setName] = useState("");
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("Invalid invite link");
      setLoading(false);
      return;
    }
    fetch(`/api/invites/${token}`)
      .then((r) => {
        if (!r.ok) {
          if (r.status === 404) setError("Invite not found");
          else if (r.status === 410) setError("This invite has expired");
          else setError("Something went wrong");
          return null;
        }
        return r.json();
      })
      .then((data) => {
        if (data) setInvite({ email: data.email, teamName: data.teamName });
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load invite");
        setLoading(false);
      });
  }, [token]);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setJoining(true);
    try {
      const res = await fetch(`/api/invites/${token}/accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to join");
        setJoining(false);
        return;
      }
      localStorage.setItem(
        "flux_user",
        JSON.stringify({ email: invite?.email || "", name: name.trim() || invite?.email })
      );
      localStorage.setItem(
        "flux_team",
        JSON.stringify({ id: data.team.id, name: data.team.name })
      );
      router.push("/app");
    } catch {
      setError("Failed to join team");
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 text-red-600">
            <AlertCircle className="h-6 w-6" />
          </div>
          <h1 className="mt-4 text-xl font-bold text-slate-900">Invalid invite</h1>
          <p className="mt-2 text-slate-600">{error}</p>
          <Link href="/">
            <Button variant="outline" className="mt-6">
              Go to Flux CRM
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-12">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-8 flex items-center gap-2">
          <div className="h-9 w-9 flex items-center justify-center rounded-lg bg-violet-600 text-white font-bold">
            F
          </div>
          <span className="text-xl font-bold text-slate-900">Flux CRM</span>
        </Link>
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
            <Users className="h-6 w-6" />
          </div>
          <h1 className="mt-4 text-2xl font-bold text-slate-900">Join {invite?.teamName}</h1>
          <p className="mt-2 text-slate-600">
            You&apos;ve been invited to join this team. Add your name and click Join to get started.
          </p>
          <form onSubmit={handleJoin} className="mt-6 space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Your name</label>
              <Input
                type="text"
                placeholder="Your name (optional)"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full" disabled={joining}>
              {joining ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Joining...
                </>
              ) : (
                "Join team"
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
