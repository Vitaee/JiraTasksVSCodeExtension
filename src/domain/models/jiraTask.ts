import { z } from "zod";

export const jiraTaskSchema = z.object({
  summary: z.string().min(1),
  description: z.string().min(1),
  acceptanceCriteria: z.array(z.string().min(1)).default([]),
  priority: z.enum(["Low", "Medium", "High", "Critical"]).optional(),
  labels: z.array(z.string().min(1)).optional(),
  storyPoints: z.number().int().nonnegative().optional(),
  risk: z.string().optional(),
});

export type JiraTask = z.infer<typeof jiraTaskSchema>;
