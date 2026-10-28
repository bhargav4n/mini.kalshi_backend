import z from "zod";

export const marketZschema = z.object({
    title : z.string().min(5),
    intialwager : z.number().int().positive(),
    side : z.enum(["yes","no"]),
    expiry : z.coerce.date()
})

export const betZshema = z.object({
    marketId : z.string(),
    amount : z.number().int().positive()
})