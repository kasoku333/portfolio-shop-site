import { useEffect } from "react";

const DEFAULT_SITE_NAME = "木陰の部屋";
const TAGLINE = "漫画・イラスト・小説の作品棚";

// ブラウザのタブ名をページごとに切り替える。
// title を渡さないページ（トップ）は「サイト名 - 説明」にする。
export function usePageTitle(title?: string, siteName: string = DEFAULT_SITE_NAME) {
  useEffect(() => {
    document.title = title ? `${title} | ${siteName}` : `${siteName} - ${TAGLINE}`;
  }, [title, siteName]);
}
