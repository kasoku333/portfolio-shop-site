import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { resolveDataPath } from "./dataDir";

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const SETTINGS_FILE = resolveDataPath("site-settings.json", currentDir);

export interface SkillItem {
  id: string;
  title: string;
  description: string;
}

export interface SnsLink {
  id: string;
  label: string;
  url: string;
}

export interface HistoryItem {
  id: string;
  date: string;
  category: "exhibition" | "publication" | "award" | "other";
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
  // X・Pixiv 以外に自由に足せるリンク（表示名とURLの組）
  snsLinks: SnsLink[];
  message: string;
  skills: SkillItem[];
  historyItems: HistoryItem[];
  // 作品の並び順（作品IDを表示順に並べたもの）。ここに無い作品は、登録順でその後ろに続く。
  artworkOrder: number[];
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
  snsLinks: [],
  message: "",
  skills: [],
  historyItems: [],
  artworkOrder: [],
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

// 並び順の指定に従って作品を並べ替える。指定に無い作品は元の順（登録順）のまま後ろに置く。
export function sortByArtworkOrder<T extends { id: number }>(items: T[], order: number[]): T[] {
  const rank = new Map(order.map((id, index) => [id, index]));
  return items
    .map((item, index) => ({ item, index }))
    .sort((a, b) => {
      const ra = rank.get(a.item.id) ?? order.length + a.index;
      const rb = rank.get(b.item.id) ?? order.length + b.index;
      return ra - rb;
    })
    .map(({ item }) => item);
}

export function saveSiteSettings(settings: Partial<SiteSettings>): SiteSettings {
  const current = getSiteSettings();
  const updated = { ...current, ...settings };
  fs.mkdirSync(path.dirname(SETTINGS_FILE), { recursive: true });
  fs.writeFileSync(SETTINGS_FILE, JSON.stringify(updated, null, 2), "utf-8");
  return updated;
}
