import mongoose from 'mongoose';
import { _enum } from 'zod/v4/core';

// create market schema
const marketSchema = mongoose.Schema({
    title:
    {
        type : String,
        required : true,
    },
    intialwager:
    {
        type : Number,
        required : true,
        default : 0
    },
    side:
    {
        type : String,
        enum : ["yes","no"],
        required : true,
    },
    creatorId:
    {
        type : mongoose.Schema.Types.ObjectId,
        ref : "user",
        required : true
    },
    expiry:
    {
        type : Date,
        required : true
    },
    resolution:
    {
        type : String,
        enum : ["yes","no"],
        default : null
    }
})

// Create the model object
export const marketmodel = mongoose.model("markets",marketSchema);