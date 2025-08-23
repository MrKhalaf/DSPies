/**
 * TypeScript type definitions for the Live Optimizing Classifier frontend.
 */

export interface RunRequest {
  input_text: string;
}

export interface RunResponse {
  run_id: string;
}

export enum RunStatus {
  PENDING = "pending",
  PROCESSING = "processing", 
  COMPLETE = "complete",
  ERROR = "error"
}

export enum EventType {
  VARIANT_START = "VariantStart",
  VARIANT_OUTPUT = "VariantOutput", 
  VARIANT_SCORED = "VariantScored",
  LEADER_CHANGE = "LeaderChange",
  RUN_COMPLETE = "RunComplete",
  ERROR = "Error"
}

export interface VariantOutput {
  category: string;
  summary: string;
}

export interface Variant {
  variant_id: string;
  prompt_spec: string;
  output?: VariantOutput;
  latency_ms?: number;
  error?: string;
}

export interface ScoreComponents {
  label_valid: number;
  label_match: number;
  summary_len_ok: number;
  no_hedging: number;
  format_ok: number;
}

export interface Score {
  variant_id: string;
  total: number;
  components: ScoreComponents;
}

export interface Event {
  ts: number;
  type: EventType;
  payload: any;
}

export interface TaskConfig {
  labels: string[];
  summary_required: boolean;
}

export interface Run {
  run_id: string;
  input_text: string;
  created_at: string;
  status: RunStatus;
  variants: Variant[];
  scores: Score[];
  winner_variant_id?: string;
  task_config: TaskConfig;
  event_log: Event[];
}

export interface Config {
  labels: string[];
  max_input_chars: number;
  demo_examples: string[];
  variant_count: number;
}

// UI State Types
export interface VariantCardState {
  variant: Variant;
  score?: Score;
  state: 'idle' | 'querying' | 'output' | 'scored' | 'error';
}

export interface OptimizationState {
  status: 'idle' | 'compiling' | 'running' | 'complete' | 'error';
  currentRun?: Run;
  variants: VariantCardState[];
  leader?: string;
  progress: number;
  showInternals: boolean;
}

export interface ReplayState {
  isReplaying: boolean;
  speed: number;
  currentEventIndex: number;
  events: Event[];
}