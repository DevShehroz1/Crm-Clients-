"use client";

import Link from "next/link";
import {
  Check,
  Zap,
  Users,
  MessageSquare,
  BarChart3,
  FolderKanban,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed left-0 right-0 top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-600 text-white font-bold">
              F
            </div>
            <span className="text-xl font-bold text-slate-900">Flux CRM</span>
          </Link>
          <nav className="hidden items-center gap-8 md:flex">
            <Link href="/owner" className="text-sm font-medium text-slate-600 hover:text-slate-900">
              Owner
            </Link>
            <a href="#features" className="text-sm font-medium text-slate-600 hover:text-slate-900">
              Features
            </a>
            <a href="#benefits" className="text-sm font-medium text-slate-600 hover:text-slate-900">
              Benefits
            </a>
            <Link href="/get-started">
              <Button>Get Started</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-20 md:pt-40 md:pb-28">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 md:text-5xl lg:text-6xl">
            Work management that
            <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent"> flows</span>
          </h1>
          <p className="mt-6 text-lg text-slate-600 md:text-xl">
            Flux CRM brings your team together. Manage tasks, communicate in channels,
            and track progress — all in one place. Like Asana and ClickUp, built for modern teams.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/get-started">
              <Button size="lg" className="gap-2 text-base px-8 py-6">
                Create your own team
                <Zap className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/app">
              <Button variant="outline" size="lg" className="text-base px-8 py-6">
                Open workspace
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-t border-slate-200 bg-slate-50 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-center text-3xl font-bold text-slate-900">
            Everything you need to get work done
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-slate-600">
            Tasks, channels, file uploads, and more — all designed for seamless collaboration.
          </p>
          <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
                <BarChart3 className="h-6 w-6" />
              </div>
              <h3 className="mt-4 font-semibold text-slate-900">Tasks & Lists</h3>
              <p className="mt-2 text-sm text-slate-600">
                Create tasks, assign owners, set due dates. Track progress with statuses like In Progress, In Review, On Hold.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                <MessageSquare className="h-6 w-6" />
              </div>
              <h3 className="mt-4 font-semibold text-slate-900">Channels</h3>
              <p className="mt-2 text-sm text-slate-600">
                Internal communication channels for your team. Discuss projects, share updates, and stay in sync.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="mt-4 font-semibold text-slate-900">Teams</h3>
              <p className="mt-2 text-sm text-slate-600">
                Invite team members, assign tasks, and collaborate. Everyone knows who&apos;s doing what.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section id="benefits" className="py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-center text-3xl font-bold text-slate-900">
            Why Flux CRM?
          </h2>
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {[
              "Track tasks with status: To Do, In Progress, In Review, Done",
              "Assign tasks to team members",
              "Upload files, images, and documents to tasks",
              "Voice notes for quick updates",
              "Channels for team communication",
              "Progress bars and due dates",
            ].map((benefit, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <Check className="h-4 w-4" />
                </div>
                <span className="text-slate-700">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-slate-200 bg-slate-50 py-20">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-3xl font-bold text-slate-900">
            Ready to streamline your work?
          </h2>
          <p className="mt-4 text-slate-600">
            Create your team, invite members, and start collaborating today.
          </p>
          <Link href="/get-started" className="mt-8 inline-block">
            <Button size="lg" className="gap-2 px-10 py-6 text-base">
              Create your own team
              <FolderKanban className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-8">
        <div className="mx-auto max-w-6xl px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600 text-white font-bold text-sm">
              F
            </div>
            <span className="font-semibold text-slate-900">Flux CRM</span>
          </div>
          <p className="text-sm text-slate-500">
            Work management for modern teams.
          </p>
        </div>
      </footer>
    </div>
  );
}
