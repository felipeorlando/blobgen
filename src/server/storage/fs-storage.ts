import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Storage } from "./types";

/**
 * Filesystem-backed storage under STORAGE_DIR. Keys may contain `/` segments
 * (e.g. `projects/<id>/script.md`); they are resolved safely under the base dir.
 */
export class FsStorage implements Storage {
  private base: string;

  constructor(baseDir: string) {
    this.base = path.resolve(process.cwd(), baseDir);
  }

  private resolve(key: string): string {
    const cleaned = key.replace(/^\/+/, "");
    const full = path.resolve(this.base, cleaned);
    if (full !== this.base && !full.startsWith(this.base + path.sep)) {
      throw new Error(`Invalid storage key (path traversal): ${key}`);
    }
    return full;
  }

  async put(key: string, body: Buffer | string): Promise<{ ref: string }> {
    const full = this.resolve(key);
    await mkdir(path.dirname(full), { recursive: true });
    await writeFile(full, body);
    return { ref: key.replace(/^\/+/, "") };
  }

  async get(ref: string): Promise<Buffer> {
    return readFile(this.resolve(ref));
  }

  async getText(ref: string): Promise<string> {
    return readFile(this.resolve(ref), "utf8");
  }

  async url(ref: string): Promise<string> {
    // Served by app/api/storage/[...ref]/route.ts in dev.
    return `/api/storage/${ref.replace(/^\/+/, "")}`;
  }

  async delete(ref: string): Promise<void> {
    await rm(this.resolve(ref), { force: true });
  }
}
