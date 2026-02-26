/**
 * Flux CRM Settings - persisted in localStorage
 */

export type Theme = "light" | "dark" | "system";
export type Density = "comfortable" | "compact";
export type FontSize = "small" | "default" | "large";
export type AccentPreset =
  | "violet"
  | "blue"
  | "emerald"
  | "amber"
  | "rose"
  | "indigo"
  | "teal"
  | "custom";

export type NotificationPrefs = {
  mentions: boolean;
  assignments: boolean;
  comments: boolean;
  reactions: boolean;
  dueSoon: boolean;
  statusChanges: boolean;
  channelUpdates: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
  quietHoursWeekends: boolean;
  digestFrequency: "off" | "daily" | "weekly";
};

export type AppearanceSettings = {
  theme: Theme;
  accent: AccentPreset;
  accentHex?: string;
  density: Density;
  fontSize: FontSize;
  reduceMotion: boolean;
  sidebarAutoCollapse: boolean;
};

export type ProfileSettings = {
  name: string;
  title: string;
  timezone: string;
  language: string;
  avatarUrl?: string;
};

export type Settings = {
  profile: ProfileSettings;
  notifications: NotificationPrefs;
  appearance: AppearanceSettings;
};

const DEFAULT_PROFILE: ProfileSettings = {
  name: "",
  title: "",
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  language: "en",
};

const DEFAULT_NOTIFICATIONS: NotificationPrefs = {
  mentions: true,
  assignments: true,
  comments: true,
  reactions: false,
  dueSoon: true,
  statusChanges: false,
  channelUpdates: false,
  quietHoursStart: "22:00",
  quietHoursEnd: "08:00",
  quietHoursWeekends: true,
  digestFrequency: "off",
};

const DEFAULT_APPEARANCE: AppearanceSettings = {
  theme: "light",
  accent: "violet",
  density: "comfortable",
  fontSize: "default",
  reduceMotion: false,
  sidebarAutoCollapse: true,
};

const STORAGE_KEY = "flux_settings";

export function loadSettings(): Settings {
  if (typeof window === "undefined")
    return {
      profile: DEFAULT_PROFILE,
      notifications: DEFAULT_NOTIFICATIONS,
      appearance: DEFAULT_APPEARANCE,
    };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultSettings();
    const parsed = JSON.parse(raw);
    return {
      profile: { ...DEFAULT_PROFILE, ...parsed.profile },
      notifications: { ...DEFAULT_NOTIFICATIONS, ...parsed.notifications },
      appearance: { ...DEFAULT_APPEARANCE, ...parsed.appearance },
    };
  } catch {
    return getDefaultSettings();
  }
}

export function getDefaultSettings(): Settings {
  return {
    profile: { ...DEFAULT_PROFILE },
    notifications: { ...DEFAULT_NOTIFICATIONS },
    appearance: { ...DEFAULT_APPEARANCE },
  };
}

export function saveSettings(settings: Settings): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

export function updateProfile(patch: Partial<ProfileSettings>): Settings {
  const s = loadSettings();
  s.profile = { ...s.profile, ...patch };
  saveSettings(s);
  return s;
}

export function updateNotifications(patch: Partial<NotificationPrefs>): Settings {
  const s = loadSettings();
  s.notifications = { ...s.notifications, ...patch };
  saveSettings(s);
  return s;
}

export function updateAppearance(patch: Partial<AppearanceSettings>): Settings {
  const s = loadSettings();
  s.appearance = { ...s.appearance, ...patch };
  saveSettings(s);
  return s;
}

export const ACCENT_COLORS: Record<AccentPreset, string> = {
  violet: "#7c3aed",
  blue: "#2563eb",
  emerald: "#059669",
  amber: "#d97706",
  rose: "#e11d48",
  indigo: "#4f46e5",
  teal: "#0d9488",
  custom: "#7c3aed",
};
