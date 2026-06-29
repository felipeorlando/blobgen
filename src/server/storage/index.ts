import { env } from "@/env";
import { FsStorage } from "./fs-storage";
import type { Storage } from "./types";

export type { Storage } from "./types";

function build(): Storage {
  switch (env.STORAGE_DRIVER) {
    case "fs":
      return new FsStorage(env.STORAGE_DIR);
    case "s3":
      throw new Error("S3/R2 storage driver is not yet implemented (future wave).");
    default:
      return new FsStorage(env.STORAGE_DIR);
  }
}

let instance: Storage | undefined;

/** The configured storage driver (singleton). */
export function storage(): Storage {
  instance ??= build();
  return instance;
}
