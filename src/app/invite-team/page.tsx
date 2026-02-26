"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, X, Mail, Loader2, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function InviteTeamPage() {
  const router = useRouter();
  const [teamId, setTeamId] = useState<string | null>(null);
  const [emails, setEmails] = useState<string[]>([""]);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [manualLinks, setManualLinks] = useState<{ email: string; joinUrl: string }[]>([]);

  useEffect(() => {
    const team = JSON.parse(localStorage.getItem("flux_team") || "{}");
    if (!team?.id) {
      router.push("/get-started");
      return;
    }
    setTeamId(team.id);
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
    if (!teamId) return;
    const valid = emails.filter((e) => e.trim().includes("@"));
    if (valid.length === 0) return;
    setSending(true);
    setManualLinks([]);
    try {
      const user = JSON.parse(localStorage.getItem("flux_user") || "{}");
      const links: { email: string; joinUrl: string }[] = [];
      for (const email of valid) {
        const res = await fetch("/api/invites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            teamId,
            email: email.trim(),
            inviterName: user.name || undefined,
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          if (data.error === "Already a member") continue;
          throw new Error(data.error || "Failed to invite");
        }
        if (!data.emailSent && data.joinUrl) {
          links.push({ email: data.email, joinUrl: data.joinUrl });
        }
      }
      setManualLinks(links);
      setSending(false);
      setSent(true);
    } catch (err) {
      console.error(err);
      setSending(false);
    }
  };

  const copyLink = (url: string) => {
    navigator.clipboard.writeText(url);
  };

  const goToWorkspace = () => router.push("/app");

  if (!teamId) return null;

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
                Add team members by email. They&apos;ll receive an invite link to join your
                workspace.
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
                <Button type="button" variant="ghost" className="w-full gap-2" onClick={addEmail}>
                  <Plus className="h-4 w-4" />
                  Add another
                </Button>
                <Button type="submit" className="w-full" disabled={sending}>
                  {sending ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Adding members...
                    </>
                  ) : (
                    "Add members"
                  )}
                </Button>
              </form>
              <Button
                variant="link"
                className="mt-4 w-full"
                onClick={goToWorkspace}
              >
                Skip for now, go to workspace
              </Button>
            </>
          ) : (
            <>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                <Mail className="h-6 w-6" />
              </div>
              <h1 className="mt-4 text-2xl font-bold text-slate-900">
                {manualLinks.length > 0 ? "Invites created" : "Invitations sent!"}
              </h1>
              <p className="mt-2 text-slate-600">
                {manualLinks.length > 0 ? (
                  <>
                    Emails couldn&apos;t be sent (add RESEND_API_KEY to enable). Copy and share
                    these links with your team:
                  </>
                ) : (
                  <>
                    Your team members will receive an email with a link to join. They can click
                    the link to be added to your workspace.
                  </>
                )}
              </p>
              {manualLinks.length > 0 && (
                <div className="mt-4 space-y-2 rounded-lg border border-amber-200 bg-amber-50 p-3">
                  {manualLinks.map(({ email, joinUrl }) => (
                    <div
                      key={email}
                      className="flex items-center gap-2 rounded border border-amber-100 bg-white p-2"
                    >
                      <span className="truncate text-sm text-slate-600">{email}</span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="ml-auto shrink-0"
                        onClick={() => {
                          copyLink(joinUrl);
                        }}
                      >
                        <Copy className="h-4 w-4" />
                        Copy link
                      </Button>
                    </div>
                  ))}
                </div>
              )}
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
