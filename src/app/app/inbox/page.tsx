"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Inbox,
  Loader2,
  AtSign,
  UserPlus,
  MessageSquare,
  Check,
  CheckCheck,
  BellOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Notification = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  url: string | null;
  isRead: boolean;
  createdAt: string;
  actorEmail: string | null;
};

const APP_URL = typeof window !== "undefined" ? "" : "";

export default function InboxPage() {
  const router = useRouter();
  const [tab, setTab] = useState("all");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const team = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("flux_team") || "{}") : {};
  const user = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("flux_user") || "{}") : {};
  const workspaceId = team?.id;
  const recipientEmail = user?.email;

  const fetchNotifications = () => {
    if (!workspaceId || !recipientEmail) {
      setLoading(false);
      return;
    }
    fetch(
      `/api/notifications?recipientEmail=${encodeURIComponent(recipientEmail)}&workspaceId=${workspaceId}&tab=${tab}`
    )
      .then((r) => (r.ok ? r.json() : { notifications: [], unreadCount: 0 }))
      .then((data) => {
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount ?? 0);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchNotifications();
  }, [workspaceId, recipientEmail, tab]);

  useEffect(() => {
    const t = setInterval(fetchNotifications, 60000);
    return () => clearInterval(t);
  }, [workspaceId, recipientEmail, tab]);

  const markRead = async (id: string) => {
    await fetch(`/api/notifications/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isRead: true }),
    });
    fetchNotifications();
  };

  const markAllRead = async () => {
    await fetch("/api/notifications/mark-read", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recipientEmail, workspaceId }),
    });
    fetchNotifications();
  };

  const goTo = (url: string | null) => {
    if (!url) return;
    try {
      const path = url.startsWith("http") ? new URL(url).pathname + new URL(url).search : url;
      router.push(path || "/app");
    } catch {
      router.push("/app");
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "MENTION":
        return <AtSign className="h-4 w-4 text-violet-500" />;
      case "ASSIGNED":
        return <UserPlus className="h-4 w-4 text-blue-500" />;
      case "COMMENT":
        return <MessageSquare className="h-4 w-4 text-slate-500" />;
      default:
        return <Inbox className="h-4 w-4 text-slate-400" />;
    }
  };

  if (!workspaceId || !recipientEmail) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-8">
        <Inbox className="mb-4 h-16 w-16 text-slate-300" />
        <h2 className="text-lg font-semibold text-slate-900">Inbox</h2>
        <p className="mt-1 text-sm text-slate-500">Sign in to see your notifications</p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900">Inbox</h1>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllRead}>
            <CheckCheck className="mr-2 h-4 w-4" />
            Mark all read
          </Button>
        )}
      </div>

      <div className="mb-4 flex gap-2 rounded-lg border border-slate-200 p-1">
        {[
          { key: "all", label: "All" },
          { key: "unread", label: "Unread" },
          { key: "mentions", label: "Mentions" },
          { key: "assigned", label: "Assigned" },
        ].map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={cn(
              "rounded-md px-4 py-2 text-sm font-medium transition-colors",
              tab === key ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 py-16">
          <Inbox className="mb-4 h-14 w-14 text-slate-300" />
          <p className="text-slate-500">No notifications</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => {
                if (!n.isRead) markRead(n.id);
                goTo(n.url);
              }}
              className={cn(
                "flex cursor-pointer items-start gap-4 rounded-lg border px-4 py-3 transition-colors hover:bg-slate-50",
                n.isRead ? "border-slate-100 bg-white" : "border-violet-100 bg-violet-50/30"
              )}
            >
              <div className="mt-0.5">{getIcon(n.type)}</div>
              <div className="min-w-0 flex-1">
                <p className={cn("text-sm", !n.isRead && "font-medium")}>{n.title}</p>
                {n.body && <p className="mt-0.5 text-xs text-slate-500 line-clamp-2">{n.body}</p>}
                <p className="mt-1 text-xs text-slate-400">
                  {new Date(n.createdAt).toLocaleString()}
                </p>
              </div>
              {!n.isRead && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    markRead(n.id);
                  }}
                  className="rounded p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-600"
                  title="Mark read"
                >
                  <Check className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
