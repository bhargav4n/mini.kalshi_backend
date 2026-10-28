export const validate = (schema)=>(req,res,next)=>
    {
    const response = schema.safeParse(req.body);

    if(!response.success)
    {
        res.status(404).json({message:"Invalid Schema"});
        return;
    }

    next();
}