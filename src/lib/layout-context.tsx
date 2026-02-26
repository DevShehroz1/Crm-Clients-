"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";

const SIDEBAR_MIN = 240;
const SIDEBAR_MAX = 360;
const SIDEBAR_DEFAULT = 260;
const SIDEBAR_COLLAPSED = 64;
const PANE_MIN = 380;
const PANE_MAX = 560;
const PANE_DEFAULT = 420;

const STORAGE_SIDEBAR = "flux_sidebar_width";
const STORAGE_COLLAPSED = "flux_sidebar_collapsed";
const STORAGE_PANE = "flux_right_pane_width";

type LayoutContextValue = {
  sidebarWidth: number;
  sidebarCollapsed: boolean;
  rightPaneWidth: number;
  setSidebarWidth: (w: number) => void;
  setSidebarCollapsed: (v: boolean) => void;
  setRightPaneWidth: (w: number) => void;
  toggleSidebar: () => void;
  startSidebarResize: (e: React.MouseEvent) => void;
  startPaneResize: (e: React.MouseEvent) => void;
};

const LayoutContext = createContext<LayoutContextValue | null>(null);

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

function snap8(v: number) {
  return Math.round(v / 8) * 8;
}

export function LayoutProvider({ children }: { children: React.ReactNode }) {
  const [sidebarWidth, setSidebarWidthState] = useState(SIDEBAR_DEFAULT);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [rightPaneWidth, setRightPaneWidthState] = useState(PANE_DEFAULT);

  const resizeRef = useRef<{ type: "sidebar" | "pane"; startX: number; startW: number } | null>(null);
  const liveWidthRef = useRef<{ sidebar: number; pane: number }>({
    sidebar: SIDEBAR_DEFAULT,
    pane: PANE_DEFAULT,
  });
  liveWidthRef.current = { sidebar: sidebarWidth, pane: rightPaneWidth };

  useEffect(() => {
    if (typeof window === "undefined") return;
    const w = localStorage.getItem(STORAGE_SIDEBAR);
    if (w) {
      const n = parseInt(w, 10);
      if (!isNaN(n)) setSidebarWidthState(clamp(n, SIDEBAR_MIN, SIDEBAR_MAX));
    }
    const c = localStorage.getItem(STORAGE_COLLAPSED);
    if (c === "true") setSidebarCollapsed(true);
    const p = localStorage.getItem(STORAGE_PANE);
    if (p) {
      const n = parseInt(p, 10);
      if (!isNaN(n)) setRightPaneWidthState(clamp(n, PANE_MIN, PANE_MAX));
    }
  }, []);

  const setSidebarWidth = useCallback((w: number) => {
    const v = clamp(snap8(w), SIDEBAR_MIN, SIDEBAR_MAX);
    setSidebarWidthState(v);
    if (typeof window !== "undefined") localStorage.setItem(STORAGE_SIDEBAR, String(v));
  }, []);

  const setRightPaneWidth = useCallback((w: number) => {
    const v = clamp(snap8(w), PANE_MIN, PANE_MAX);
    setRightPaneWidthState(v);
    if (typeof window !== "undefined") localStorage.setItem(STORAGE_PANE, String(v));
  }, []);

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      if (typeof window !== "undefined") localStorage.setItem(STORAGE_COLLAPSED, String(next));
      return next;
    });
  }, []);

  const startSidebarResize = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      resizeRef.current = {
        type: "sidebar",
        startX: e.clientX,
        startW: sidebarCollapsed ? SIDEBAR_DEFAULT : sidebarWidth,
      };
    },
    [sidebarWidth, sidebarCollapsed]
  );

  const startPaneResize = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      resizeRef.current = {
        type: "pane",
        startX: e.clientX,
        startW: rightPaneWidth,
      };
    },
    [rightPaneWidth]
  );

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      const r = resizeRef.current;
      if (!r) return;
      if (r.type === "sidebar") {
        const dx = e.clientX - r.startX;
        const newW = clamp(snap8(r.startW + dx), SIDEBAR_MIN, SIDEBAR_MAX);
        setSidebarWidthState(newW);
        liveWidthRef.current.sidebar = newW;
      } else {
        const dx = r.startX - e.clientX;
        const newW = clamp(snap8(r.startW + dx), PANE_MIN, PANE_MAX);
        setRightPaneWidthState(newW);
        liveWidthRef.current.pane = newW;
      }
    };
    const onMouseUp = () => {
      const r = resizeRef.current;
      if (!r) return;
      const live = liveWidthRef.current;
      if (r.type === "sidebar") {
        const v = clamp(snap8(live.sidebar), SIDEBAR_MIN, SIDEBAR_MAX);
        if (typeof window !== "undefined") localStorage.setItem(STORAGE_SIDEBAR, String(v));
      } else {
        const v = clamp(snap8(live.pane), PANE_MIN, PANE_MAX);
        if (typeof window !== "undefined") localStorage.setItem(STORAGE_PANE, String(v));
      }
      resizeRef.current = null;
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, []);

  const value: LayoutContextValue = {
    sidebarWidth,
    sidebarCollapsed,
    rightPaneWidth,
    setSidebarWidth,
    setSidebarCollapsed,
    setRightPaneWidth,
    toggleSidebar,
    startSidebarResize,
    startPaneResize,
  };

  return <LayoutContext.Provider value={value}>{children}</LayoutContext.Provider>;
}

export function useLayout() {
  const ctx = useContext(LayoutContext);
  if (!ctx) throw new Error("useLayout must be used within LayoutProvider");
  return ctx;
}
