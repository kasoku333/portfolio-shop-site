import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const SETTINGS_FILE = path.resolve(currentDir, "site-settings.json");

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
}

const DEFAULT_SETTINGS: SiteSettings = {
  siteName: "Atelier Shelf",
  siteSubtitle: "Portfolio Shop",
  creatorName: "クリエイター名",
  email: "hello@atelier-shelf.example",
  bio: "イラスト、漫画、小説を制作するクリエイターです。",
  profileImageUrl: "",
  twitterUrl: "",
  pixivUrl: "",
  otherUrl: "",
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
