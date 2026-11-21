export type ResourceName =
  | "places"
  | "security-incidents"
  | "road-segments"
  | "cadastral-properties"
  | "localities";

export type Entity = Record<string, unknown>;

export interface PageMeta {
  total: number;
  limit: number;
  offset: number;
}

export interface ListResult {
  data: Entity[];
  meta: PageMeta;
}

export interface AgentAnswer {
  question: string;
  answer: string;
  generatedBy: string;
  intents: string[];
  groups: unknown[];
  suggestions: string[];
}

export type QueryParams = Record<string, string | number | undefined>;
