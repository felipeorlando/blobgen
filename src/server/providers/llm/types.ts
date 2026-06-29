export interface LLMMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface LLMResult {
  text: string;
  usage: { inputTokens: number; outputTokens: number };
  model: string;
  raw: unknown;
}

export interface LLMCompleteArgs {
  system?: string;
  messages: LLMMessage[];
  model?: string;
  temperature?: number;
  maxTokens?: number;
  responseFormat?: "json" | "text";
  /**
   * A schema-valid example the MOCK provider returns verbatim (as JSON) when no
   * API key is configured, so the full pipeline runs keyless in dev. Ignored by
   * real providers.
   */
  sample?: unknown;
}

export interface LLMProvider {
  readonly name: string;
  complete(args: LLMCompleteArgs): Promise<LLMResult>;
}
