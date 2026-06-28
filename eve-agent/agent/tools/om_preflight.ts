import { defineTool } from "eve/tools";
import { z } from "zod";
import { preflight, isOpenMontageConfigured } from "../lib/openmontage.js";

export default defineTool({
  description:
    "Run the OpenMontage preflight: list available providers/tools and the zero-key capability set for the current environment. Call this FIRST so you know what can be produced and roughly what each stage will cost.",
  inputSchema: z.object({}),
  async execute() {
    if (!isOpenMontageConfigured()) {
      return {
        configured: false,
        note: "OpenMontage is not installed (OPENMONTAGE_DIR unset). Only the zero-key fallback is available.",
      };
    }
    const res = await preflight();
    return { configured: true, ...res };
  },
});
