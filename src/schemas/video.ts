import z from 'zod'

// Video Feed Query Schema (Validation with Zod)
export const videoFeedQuerySchema = z.object({
    page: z.number().min(1).default(1),
    limit: z.number().min(1).max(50).default(20),
    category: z.string().optional(),
});