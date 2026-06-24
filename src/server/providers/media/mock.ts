import type { MediaGenInput, MediaGenResult, MediaProvider } from "./types";

// Local images that ship in /public/images, so shot previews render keyless.
const LOCAL = [
  "/images/space.jpg",
  "/images/tech.jpg",
  "/images/mountains.jpg",
  "/images/city.jpg",
  "/images/history.jpg",
  "/images/desk.jpg",
  "/images/motivation.jpg",
  "/images/notebook.jpg",
];

export class MockMediaProvider implements MediaProvider {
  readonly name = "mock-media";
  private n = 0;

  async generate(args: MediaGenInput): Promise<MediaGenResult> {
    if (args.kind === "image") {
      const url = LOCAL[this.n++ % LOCAL.length];
      return { url, model: "mock", raw: { mock: true }, mock: true };
    }
    // tts / video have no real binary in mock mode.
    return { url: "", model: "mock", raw: { mock: true }, mock: true };
  }
}
