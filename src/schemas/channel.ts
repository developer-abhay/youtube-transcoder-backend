import z from 'zod'

export const channelCreateSchema = z.object({
    name: z.string({
        required_error: 'Channel name is required',
    }).min(1),
    description: z.string({
        required_error: 'description is required',
    }).min(1,),
    slug: z.string({
        required_error: 'Slug is required',
    }).min(1),
});