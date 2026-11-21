import type { AgentAnswer, Entity, ListResult, QueryParams, ResourceName } from "../types.js";

/**
 * Puerto del backend (Dependency Inversion).
 * Las rutas dependen de esta interfaz, no de fetch ni de URLs concretas.
 */
export interface BackendPort {
  list(resource: ResourceName, query: QueryParams): Promise<ListResult>;
  get(resource: ResourceName, id: string): Promise<Entity>;
  create(resource: ResourceName, input: unknown): Promise<Entity>;
  update(resource: ResourceName, id: string, patch: unknown): Promise<Entity>;
  remove(resource: ResourceName, id: string): Promise<void>;
  categories(): Promise<Entity[]>;
  stats(): Promise<Entity>;
  search(query: string, limit: number): Promise<Entity>;
  ask(question: string): Promise<AgentAnswer>;
  ping(): Promise<{ status: string; engine?: string }>;
}
