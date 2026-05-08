import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const SETTINGS_FILE = path.resolve(currentDir, "site-settings.json");

export interface SkillItem {
  id: string;
  title: string;
  description: string;
}

export interface HistoryItem {
  id: string;
  date: string;
  category: "site" | "creation" | "post" | "exhibition" | "publication" | "award" | "other";
  title: string;
  description: string;
  sortOrder: number;
  isPublished: boolean;
}

export interface SiteSettings {
  siteName: string;
  siteSubtitle: string;
  creatorName: string;
  email: string;
  bio: string;
  profileImageUrl: string;
  twitterUrl: string;
  pixivUrl: string;
  otherUrl: string;
  message: string;
  skills: SkillItem[];
  historyItems: HistoryItem[];
}

const DEFAULT_SETTINGS: SiteSettings = {
  siteName: "木陰の部屋",
  siteSubtitle: "PORTFOLIO & SHOP",
  creatorName: "クリエイター名",
  email: "hello@example.com",
  bio: "漫画・イラスト・小説を制作しています。\n日常のすき間に、ふっと覗きたくなるような物語や絵を置いています。",
  profileImageUrl: "",
  twitterUrl: "",
  pixivUrl: "",
  otherUrl: "",
  message: "",
  skills: [],
  historyItems: [],
};

export function getSiteSettings(): SiteSettings {
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      const data = fs.readFileSync(SETTINGS_FILE, "utf-8");
      return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
    }
  } catch (e) {
    console.warn("[SiteSettings] Failed to read settings:", e);
  }
  return { ...DEFAULT_SETTINGS };
}

export function saveSiteSettings(settings: Partial<SiteSettings>): SiteSettings {
  const current = getSiteSettings();
  const updated = { ...current, ...settings };
  fs.writeFileSync(SETTINGS_FILE, JSON.stringify(updated, null, 2), "utf-8");
  return updated;
}
