import mongoose from 'mongoose';

const betSchema = mongoose.Schema({
    userId:
    {
        type : mongoose.Schema.Types.ObjectId,
        ref : "users",
        required : true
    },
    marketId:
    {
        type : mongoose.Schema.Types.ObjectId,
        ref : "markets",
        required : true
    },
    amount:
    {
        type : Number,
        required : true,
        default : 0
    }
})

export const betmodel = mongoose.model("bet",betSchema);