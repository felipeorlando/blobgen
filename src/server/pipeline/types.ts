import type {
  AssetKind,
  Channel,
  ChannelConfig,
  Project,
  StageKey,
} from "@/db/schema";
import type {
  LLMProvider,
  MediaProvider,
  SearchProvider,
  StockProvider,
  YouTubeProvider,
} from "@/server/providers";
import type { Storage } from "@/server/storage";

export type StageProviders = {
  llm: LLMProvider;
  search: SearchProvider;
  youtube: YouTubeProvider;
  stock: StockProvider;
  media: MediaProvider;
};

export interface ApiUsageInput {
  provider: string;
  model?: string;
  requestKind?: string;
  inputTokens?: number;
  outputTokens?: number;
  costUsd?: number;
  latencyMs?: number;
  raw?: unknown;
}

/** An asset a stage emits; the engine persists it with project/stageRun links. */
export interface NewStageAsset {
  kind: AssetKind;
  title?: string;
  data?: unknown;
  storageRef?: string;
  meta?: Record<string, unknown>;
  visual?: boolean;
}

export interface StageContext {
  project: Project;
  channel: Channel;
  config: ChannelConfig | null;
  /** Outputs of already-completed stages, keyed by stage. */
  priorOutputs: Partial<Record<StageKey, unknown>>;
  /** Critic feedback from a prior attempt (ai_review revise), if any. */
  revisionNotes?: string;
  providers: StageProviders;
  storage: Storage;
  recordUsage(u: ApiUsageInput): Promise<void>;
  logger: (msg: string, meta?: unknown) => void;
}

export interface StageResult {
  /** Persisted to stage_run.output and made available to later stages. */
  output: unknown;
  assets: NewStageAsset[];
  /** Actual credits consumed (from token/call usage). */
  actualCredits: number;
  projectPatch?: Partial<Pick<Project, "title" | "thumb">>;
}

/** A pipeline stage. Business logic only — never writes status or touches credits. */
export interface Stage {
  key: StageKey;
  label: string;
  /** false = stubbed; the engine pauses at it for manual approval. */
  implemented: boolean;
  estimateCredits(ctx: StageContext): number;
  run(ctx: StageContext): Promise<StageResult>;
}
