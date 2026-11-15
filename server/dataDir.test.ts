import { afterEach, describe, expect, it, vi } from "vitest";
import path from "path";
import { resolveDataPath } from "./dataDir";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("resolveDataPath", () => {
  it("falls back to the given directory when nothing is configured", () => {
    vi.stubEnv("DATA_DIR", "");
    vi.stubEnv("RAILWAY_VOLUME_MOUNT_PATH", "");
    expect(resolveDataPath("uploads", "/app/server")).toBe(path.resolve("/app/server/uploads"));
  });

  it("uses the Railway volume when one is mounted", () => {
    vi.stubEnv("DATA_DIR", "");
    vi.stubEnv("RAILWAY_VOLUME_MOUNT_PATH", "/data");
    expect(resolveDataPath("site-settings.json", "/app/server")).toBe(path.resolve("/data/site-settings.json"));
  });

  it("prefers DATA_DIR over the Railway volume", () => {
    vi.stubEnv("DATA_DIR", "/custom");
    vi.stubEnv("RAILWAY_VOLUME_MOUNT_PATH", "/data");
    expect(resolveDataPath("uploads", "/app/server")).toBe(path.resolve("/custom/uploads"));
  });
});
