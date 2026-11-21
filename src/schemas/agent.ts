import { z } from "zod";

export const agentAskSchema = z
  .object({
    question: z.string().trim().min(3, "La pregunta es muy corta").max(400),
  })
  .strict();

export const searchQuerySchema = z.object({
  q: z.string().trim().min(2, "Escribe al menos 2 caracteres").max(120),
  limit: z.coerce.number().int().min(1).max(50).default(8),
});

export type AgentAskInput = z.infer<typeof agentAskSchema>;
export type SearchQuery = z.infer<typeof searchQuerySchema>;
