import { describe, expect, test } from "bun:test";
import { ReplicateMediaProvider } from "./replicate";

describe("ReplicateMediaProvider", () => {
  test("creates a prediction, polls until succeeded, returns the output url", async () => {
    const calls: { url: string; init?: RequestInit }[] = [];
    let polls = 0;
    const fetchImpl = (async (url: unknown, init?: RequestInit) => {
      const u = String(url);
      calls.push({ url: u, init });
      if (init?.method === "POST") {
        return {
          ok: true,
          json: async () => ({
            status: "processing",
            urls: { get: "https://api.replicate.com/v1/predictions/abc" },
          }),
        } as Response;
      }
      polls++;
      if (polls < 2) {
        return {
          ok: true,
          json: async () => ({
            status: "processing",
            urls: { get: "https://api.replicate.com/v1/predictions/abc" },
          }),
        } as Response;
      }
      return {
        ok: true,
        json: async () => ({
          status: "succeeded",
          output: ["https://replicate.delivery/out.png"],
          metrics: { predict_time: 3.2 },
        }),
      } as Response;
    }) as unknown as typeof fetch;

    const provider = new ReplicateMediaProvider({
      apiToken: "r8-test",
      imageModel: "owner/model",
      fetchImpl,
      pollIntervalMs: 1,
    });
    const res = await provider.generate({ kind: "image", prompt: "a cat" });

    expect(res.url).toBe("https://replicate.delivery/out.png");
    expect(res.predictSeconds).toBe(3.2);

    const post = calls.find((c) => c.init?.method === "POST")!;
    expect(post.url).toContain("/models/owner/model/predictions");
    expect((post.init!.headers as Record<string, string>).Authorization).toBe(
      "Token r8-test",
    );
    expect(JSON.parse(post.init!.body as string).input.prompt).toBe("a cat");
  });

  test("throws ProviderNotConfigured when the model id is missing", async () => {
    const provider = new ReplicateMediaProvider({ apiToken: "x" });
    await expect(
      provider.generate({ kind: "image", prompt: "y" }),
    ).rejects.toThrow(/REPLICATE_IMAGE_MODEL/);
  });

  test("throws on a failed prediction", async () => {
    const fetchImpl = (async () =>
      ({
        ok: true,
        json: async () => ({ status: "failed", error: "boom" }),
      }) as Response) as unknown as typeof fetch;
    const provider = new ReplicateMediaProvider({
      apiToken: "x",
      imageModel: "o/m",
      fetchImpl,
      pollIntervalMs: 1,
    });
    await expect(
      provider.generate({ kind: "image", prompt: "y" }),
    ).rejects.toThrow(/failed: boom/);
  });
});
