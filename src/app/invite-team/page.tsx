"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, X, Mail, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function InviteTeamPage() {
  const router = useRouter();
  const [emails, setEmails] = useState<string[]>([""]);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    const user = localStorage.getItem("flux_user");
    if (!user) router.push("/get-started");
  }, [router]);

  const addEmail = () => setEmails((e) => [...e, ""]);

  const updateEmail = (i: number, v: string) => {
    setEmails((e) => {
      const n = [...e];
      n[i] = v;
      return n;
    });
  };

  const removeEmail = (i: number) => {
    if (emails.length <= 1) return;
    setEmails((e) => e.filter((_, idx) => idx !== i));
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    const valid = emails.filter((e) => e.trim().includes("@"));
    if (valid.length === 0) return;
    setSending(true);
    // Simulate invite - in production would call API to send emails
    await new Promise((r) => setTimeout(r, 1500));
    const team = JSON.parse(localStorage.getItem("flux_team") || "{}");
    team.invited = valid;
    localStorage.setItem("flux_team", JSON.stringify(team));
    setSending(false);
    setSent(true);
  };

  const goToWorkspace = () => router.push("/app");

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-12">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-8 flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-600 text-white font-bold">
            F
          </div>
          <span className="text-xl font-bold text-slate-900">Flux CRM</span>
        </Link>
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          {!sent ? (
            <>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
                <Mail className="h-6 w-6" />
              </div>
              <h1 className="mt-4 text-2xl font-bold text-slate-900">Invite your team</h1>
              <p className="mt-2 text-slate-600">
                Add team members by email. They&apos;ll receive an invite to join your workspace.
              </p>
              <form onSubmit={handleInvite} className="mt-6 space-y-3">
                {emails.map((email, i) => (
                  <div key={i} className="flex gap-2">
                    <Input
                      type="email"
                      placeholder="teammate@company.com"
                      value={email}
                      onChange={(e) => updateEmail(i, e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeEmail(i)}
                      disabled={emails.length <= 1}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full gap-2"
                  onClick={addEmail}
                >
                  <Plus className="h-4 w-4" />
                  Add another
                </Button>
                <Button type="submit" className="w-full" disabled={sending}>
                  {sending ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Sending invites...
                    </>
                  ) : (
                    "Send invites"
                  )}
                </Button>
              </form>
            </>
          ) : (
            <>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                <Mail className="h-6 w-6" />
              </div>
              <h1 className="mt-4 text-2xl font-bold text-slate-900">Invites sent!</h1>
              <p className="mt-2 text-slate-600">
                Your team members will receive an email. You can go to your workspace now.
              </p>
              <Button className="mt-6 w-full" onClick={goToWorkspace}>
                Go to workspace
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
