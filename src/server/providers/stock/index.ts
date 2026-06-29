import { env, ProviderNotConfigured } from "@/env";
import { allowMock, warnMockOnce } from "../_util";
import { MockStockProvider } from "./mock";
import { PexelsProvider } from "./pexels";
import type { StockProvider } from "./types";

export type { StockProvider, StockItem } from "./types";

let instance: StockProvider | undefined;

/** The configured stock-material provider (Pexels, or a keyless mock in dev). */
export function stock(): StockProvider {
  if (instance) return instance;
  if (env.PEXELS_API_KEY) {
    instance = new PexelsProvider({ apiKey: env.PEXELS_API_KEY });
  } else if (allowMock()) {
    warnMockOnce("Pexels stock", "PEXELS_API_KEY");
    instance = new MockStockProvider();
  } else {
    throw new ProviderNotConfigured("Pexels", "PEXELS_API_KEY");
  }
  return instance;
}
