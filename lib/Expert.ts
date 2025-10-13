import { z } from 'zod';

export const ExpertSchema = z.object({
  id: z.string(),
  name: z.string(),
  role: z.string(),
  dept: z.string().optional(),
  bio: z.string().optional(),
  email: z.string().email().optional(),
  teamsId: z.string().optional(),
  languages: z.array(z.string()),
  products: z.array(z.string()),
  skills: z.array(z.string()),
  region: z.string().optional(),
  seniority: z.string().optional(),
  load: z.number().optional(),
  success: z.number().optional(),
  last_seen: z.string().optional(), // ISO date string
});

export type Expert = z.infer<typeof ExpertSchema>;
