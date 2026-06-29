import { env, ProviderNotConfigured } from "@/env";
import { allowMock, warnMockOnce } from "../_util";
import { MockLLMProvider } from "./mock";
import { OpenRouterProvider } from "./openrouter";
import type { LLMProvider } from "./types";

export type {
  LLMProvider,
  LLMResult,
  LLMMessage,
  LLMCompleteArgs,
} from "./types";

let instance: LLMProvider | undefined;

/** The configured LLM provider (OpenRouter, or a keyless mock in dev). */
export function llm(): LLMProvider {
  if (instance) return instance;
  if (env.OPENROUTER_API_KEY) {
    instance = new OpenRouterProvider({
      apiKey: env.OPENROUTER_API_KEY,
      defaultModel: env.OPENROUTER_MODEL,
    });
  } else if (allowMock()) {
    warnMockOnce("OpenRouter LLM", "OPENROUTER_API_KEY");
    instance = new MockLLMProvider();
  } else {
    throw new ProviderNotConfigured("OpenRouter", "OPENROUTER_API_KEY");
  }
  return instance;
}
