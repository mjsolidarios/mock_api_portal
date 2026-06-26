import { z } from "zod";

export const feedbackSchema = z.object({
  userId: z.string().min(1).optional().or(z.literal("")),
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().min(8).max(500)
});
