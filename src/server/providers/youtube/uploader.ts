export type PrivacyStatus = "private" | "unlisted" | "public";

export interface UploadArgs {
  accessToken: string;
  buffer: Buffer;
  title: string;
  description?: string;
  privacyStatus?: PrivacyStatus;
  /** Schedule a public publish (forces privacyStatus "private" until then). */
  publishAt?: Date;
}

export interface UploadResult {
  videoId: string;
  url: string;
  mock?: boolean;
}

export interface YouTubeUploader {
  readonly name: string;
  upload(args: UploadArgs): Promise<UploadResult>;
}

const ENDPOINT =
  "https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status";

/** Real uploader: YouTube Data API resumable upload (initiate → PUT bytes). */
export class ResumableYouTubeUploader implements YouTubeUploader {
  readonly name = "youtube";

  constructor(private opts: { fetchImpl?: typeof fetch } = {}) {}

  async upload(args: UploadArgs): Promise<UploadResult> {
    const doFetch = this.opts.fetchImpl ?? fetch;
    const metadata = {
      snippet: {
        title: args.title.slice(0, 100),
        description: (args.description ?? "").slice(0, 4900),
        categoryId: "22",
      },
      status: {
        privacyStatus: args.publishAt ? "private" : (args.privacyStatus ?? "private"),
        ...(args.publishAt ? { publishAt: args.publishAt.toISOString() } : {}),
        selfDeclaredMadeForKids: false,
      },
    };

    // 1) Start a resumable session.
    const init = await doFetch(ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${args.accessToken}`,
        "Content-Type": "application/json; charset=UTF-8",
        "X-Upload-Content-Type": "video/mp4",
        "X-Upload-Content-Length": String(args.buffer.length),
      },
      body: JSON.stringify(metadata),
    });
    if (!init.ok) {
      const body = await init.text().catch(() => "");
      throw new Error(`YouTube init ${init.status}: ${body.slice(0, 300)}`);
    }
    const location = init.headers.get("location");
    if (!location) throw new Error("YouTube resumable: missing upload Location header");

    // 2) Upload the bytes.
    const put = await doFetch(location, {
      method: "PUT",
      headers: { "Content-Type": "video/mp4" },
      body: new Uint8Array(args.buffer),
    });
    if (!put.ok) {
      const body = await put.text().catch(() => "");
      throw new Error(`YouTube upload ${put.status}: ${body.slice(0, 300)}`);
    }
    const json = (await put.json()) as { id?: string };
    if (!json.id) throw new Error("YouTube upload: no video id returned");
    return { videoId: json.id, url: `https://youtu.be/${json.id}` };
  }
}

/** Keyless dev fallback — simulates a publish without touching YouTube. */
export class MockYouTubeUploader implements YouTubeUploader {
  readonly name = "mock-youtube-uploader";

  async upload(args: UploadArgs): Promise<UploadResult> {
    const slug =
      args.title.toLowerCase().replace(/[^a-z0-9]+/g, "").slice(0, 8) || "mockvid";
    const id = `mock-${slug}-${args.buffer.length % 100000}`;
    return { videoId: id, url: `https://youtu.be/${id}`, mock: true };
  }
}
