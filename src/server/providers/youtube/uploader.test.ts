import { describe, expect, test } from "bun:test";
import { MockYouTubeUploader, ResumableYouTubeUploader } from "./uploader";

describe("ResumableYouTubeUploader", () => {
  test("starts a resumable session, PUTs the bytes, returns id + url", async () => {
    const calls: { url: string; method?: string }[] = [];
    const fetchImpl = (async (url: unknown, init?: RequestInit) => {
      calls.push({ url: String(url), method: init?.method });
      if (init?.method === "POST") {
        return {
          ok: true,
          headers: new Headers({ location: "https://upload.example/session-1" }),
        } as Response;
      }
      return { ok: true, json: async () => ({ id: "abc123" }) } as Response;
    }) as unknown as typeof fetch;

    const uploader = new ResumableYouTubeUploader({ fetchImpl });
    const res = await uploader.upload({
      accessToken: "tok",
      buffer: Buffer.from("video-bytes"),
      title: "My Short",
      description: "desc",
      publishAt: new Date("2030-01-01T12:00:00Z"),
    });

    expect(res.videoId).toBe("abc123");
    expect(res.url).toBe("https://youtu.be/abc123");
    const post = calls.find((c) => c.method === "POST")!;
    expect(post.url).toContain("uploadType=resumable");
    expect(
      calls.some(
        (c) => c.method === "PUT" && c.url === "https://upload.example/session-1",
      ),
    ).toBe(true);
  });

  test("throws when the session has no Location header", async () => {
    const fetchImpl = (async () =>
      ({ ok: true, headers: new Headers() }) as Response) as unknown as typeof fetch;
    const uploader = new ResumableYouTubeUploader({ fetchImpl });
    await expect(
      uploader.upload({ accessToken: "t", buffer: Buffer.from("x"), title: "t" }),
    ).rejects.toThrow(/Location/);
  });
});

describe("MockYouTubeUploader", () => {
  test("returns a deterministic fake video", async () => {
    const res = await new MockYouTubeUploader().upload({
      accessToken: "",
      buffer: Buffer.from("x"),
      title: "Hello World",
    });
    expect(res.mock).toBe(true);
    expect(res.url).toContain("youtu.be/");
  });
});
