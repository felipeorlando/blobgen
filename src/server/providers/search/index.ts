import { env, ProviderNotConfigured } from "@/env";
import { allowMock, warnMockOnce } from "../_util";
import { ExaProvider } from "./exa";
import { MockSearchProvider } from "./mock";
import { TavilyProvider } from "./tavily";
import type { SearchProvider } from "./types";

export type { SearchProvider, SearchResult } from "./types";

let instance: SearchProvider | undefined;

/** The configured web-research provider (Tavily/Exa, or a keyless mock in dev). */
export function search(): SearchProvider {
  if (instance) return instance;
  const useExa = env.SEARCH_PROVIDER === "exa";
  const key = useExa ? env.EXA_API_KEY : env.TAVILY_API_KEY;
  const envVar = useExa ? "EXA_API_KEY" : "TAVILY_API_KEY";

  if (key) {
    instance = useExa
      ? new ExaProvider({ apiKey: key })
      : new TavilyProvider({ apiKey: key });
  } else if (allowMock()) {
    warnMockOnce(`${useExa ? "Exa" : "Tavily"} search`, envVar);
    instance = new MockSearchProvider();
  } else {
    throw new ProviderNotConfigured(useExa ? "Exa" : "Tavily", envVar);
  }
  return instance;
}
