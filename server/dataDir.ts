import path from "path";

// 実行時に書き込むデータ（アップロード画像・サイト設定）の置き場所。
// Railway では Volume を付けると RAILWAY_VOLUME_MOUNT_PATH が自動で入るので、
// そこに置けば再デプロイ・再起動しても消えない。
// どちらも未設定ならこれまでどおり各モジュールの隣（ローカル開発用）に置く。
export function resolveDataPath(name: string, fallbackDir: string): string {
  const dataDir = process.env.DATA_DIR || process.env.RAILWAY_VOLUME_MOUNT_PATH;
  return path.resolve(dataDir || fallbackDir, name);
}
