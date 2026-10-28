import z from 'zod';

export const resolveZschema = z.object({
    marketId : z.string(),
    resolution : z.enum(["yes","no"])
})