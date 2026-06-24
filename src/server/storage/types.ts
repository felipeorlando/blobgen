/** Blob storage behind a swappable driver (fs for dev, S3/R2 later). */
export interface Storage {
  /** Persist bytes/text under `key`; returns the durable ref to store in the DB. */
  put(
    key: string,
    body: Buffer | string,
    contentType?: string,
  ): Promise<{ ref: string }>;
  get(ref: string): Promise<Buffer>;
  getText(ref: string): Promise<string>;
  /** A URL the browser can fetch (local route in dev, signed URL in the cloud). */
  url(ref: string): Promise<string>;
  delete(ref: string): Promise<void>;
}
