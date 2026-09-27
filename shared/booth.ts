// BOOTH の商品ページか判定する。
// 管理画面から入る URL をそのまま <a href> に使うので、https の BOOTH 以外
// （javascript: や別サイト）を弾いておく。
export function isBoothUrl(value: string): boolean {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return false;
  }
  return (
    url.protocol === "https:" &&
    (url.hostname === "booth.pm" || url.hostname.endsWith(".booth.pm"))
  );
}
