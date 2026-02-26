"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  Plus,
  Trash2,
  ExternalLink,
  ClipboardList,
  Loader2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type Client = {
  id: string;
  name: string;
  email: string | null;
  company: string | null;
  slug: string;
  tasks: { id: string; title: string; status: string }[];
};

export default function DashboardPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");

  const fetchClients = async () => {
    try {
      const res = await fetch("/api/clients");
      if (res.ok) {
        const data = await res.json();
        setClients(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim() || undefined, company: company.trim() || undefined }),
      });
      if (res.ok) {
        await fetchClients();
        setName("");
        setEmail("");
        setCompany("");
        setAddOpen(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteClient = async (id: string) => {
    if (!confirm("Delete this client? All their tasks will be removed.")) return;
    try {
      const res = await fetch(`/api/clients/${id}`, { method: "DELETE" });
      if (res.ok) await fetchClients();
    } catch (err) {
      console.error(err);
    }
  };

  const copyClientLink = (slug: string) => {
    const url = `${typeof window !== "undefined" ? window.location.origin : ""}/client/${slug}`;
    navigator.clipboard.writeText(url);
    alert("Client link copied to clipboard!");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-14 max-w-4xl items-center px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-600 text-white">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-base font-semibold text-slate-900">
                Client CRM
              </h1>
              <p className="text-xs text-slate-500">
                Manage clients and tasks
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              Clients
            </h2>
            <p className="mt-0.5 text-sm text-slate-500">
              Add clients and share their task portal link
            </p>
          </div>
          <Button
            className="gap-2"
            onClick={() => setAddOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Add Client
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
          </div>
        ) : clients.length === 0 ? (
          <Card className="border-dashed border-2 border-slate-200">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
                <Users className="h-7 w-7 text-slate-400" />
              </div>
              <h3 className="text-base font-medium text-slate-900">
                No clients yet
              </h3>
              <p className="mt-1 text-center text-sm text-slate-500">
                Add your first client and share their link for task assignment.
              </p>
              <Button
                className="mt-5 gap-2"
                onClick={() => setAddOpen(true)}
              >
                <Plus className="h-4 w-4" />
                Add Client
              </Button>
            </CardContent>
          </Card>
        ) : null}

        {addOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setAddOpen(false)}
              aria-hidden
            />
            <div className="relative z-10 w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-base font-semibold text-slate-900">Add New Client</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setAddOpen(false)}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <form onSubmit={handleAddClient} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Name *
                  </label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Client name"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Email
                  </label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="client@example.com"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Company
                  </label>
                  <Input
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Company name"
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <Button type="submit">Add Client</Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setAddOpen(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {clients.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {clients.map((client) => (
              <Card
                key={client.id}
                className="overflow-hidden border-slate-200 transition-shadow hover:shadow-md"
              >
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                  <div>
                    <CardTitle className="text-base font-semibold text-slate-900">
                      {client.name}
                    </CardTitle>
                    {client.company && (
                      <p className="text-sm text-slate-500">
                        {client.company}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Link href={`/client/${client.slug}`} target="_blank">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-500 hover:text-slate-700"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-600"
                      onClick={() => handleDeleteClient(client.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <ClipboardList className="h-4 w-4" />
                    <span>
                      {client.tasks.length} task
                      {client.tasks.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/manage/${client.id}`} className="flex-1">
                      <Button className="w-full gap-2">Manage Tasks</Button>
                    </Link>
                    <Button
                      variant="outline"
                      className="flex-1 gap-2"
                      onClick={() => copyClientLink(client.slug)}
                    >
                      Copy Link
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : null}
      </main>
    </div>
  );
}
