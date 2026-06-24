import { auth } from "@/server/auth";
import { storage } from "@/server/storage";

const TYPES: Record<string, string> = {
  md: "text/markdown; charset=utf-8",
  json: "application/json; charset=utf-8",
  txt: "text/plain; charset=utf-8",
  mp3: "audio/mpeg",
  wav: "audio/wav",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
  mp4: "video/mp4",
};

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ ref: string[] }> },
) {
  const session = await auth();
  if (!session?.user?.id) return new Response("Unauthorized", { status: 401 });

  const { ref } = await ctx.params;
  const key = ref.join("/");
  const ext = key.split(".").pop() ?? "";
  try {
    const buf = await storage().get(key);
    return new Response(new Uint8Array(buf), {
      headers: { "Content-Type": TYPES[ext] ?? "application/octet-stream" },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
