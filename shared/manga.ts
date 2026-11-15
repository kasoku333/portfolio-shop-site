// 漫画のページ表示まわりで、サーバとクライアントの両方が使うもの。

// 1作品あたりのページ数の上限。1枚ずつ base64 で送るので、多すぎると登録に時間がかかる。
export const MAX_MANGA_PAGES = 200;

// upload.image が返す URL（/uploads/<nanoid>.<拡張子>）の形。
// ディレクトリ名に "." を許さないので、"../" で上に辿る形も通らない。
const UPLOADED_IMAGE_PATH =
  /^\/uploads\/(?:[A-Za-z0-9_-]+\/)*[A-Za-z0-9_-]+\.(?:jpg|png|gif|webp|avif)$/;

// ページ画像として受け付ける URL か判定する。<img src> にそのまま入るので、
// javascript: や data: などの別スキームを弾く。
// https を通すのは、ローカル保存に移る前（S3 時代）に登録した表紙 URL が残っていても、
// その漫画を編集・保存できるようにするため。
export function isPageImageUrl(value: string): boolean {
  if (UPLOADED_IMAGE_PATH.test(value)) return true;
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

// 読む順のページ画像を返す。ページ欄ができる前に登録した漫画は pages が null なので、
// 表紙（imageUrl）1枚の漫画として扱う。
export function getMangaPages(artwork: {
  pages?: string[] | null;
  imageUrl?: string | null;
}): string[] {
  if (artwork.pages && artwork.pages.length > 0) return artwork.pages;
  return artwork.imageUrl ? [artwork.imageUrl] : [];
}

export type MangaViewMode = "vertical" | "horizontal";
