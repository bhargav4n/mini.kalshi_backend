import mongoose from 'mongoose';

const walletSchema = mongoose.Schema({
    userId: 
    {
        type : mongoose.Schema.Types.ObjectId,
        ref : "users",
        required : true
    },
    tx_type:
    {
        type : String,
        enum: ["onramp", "created", "bet", "payout", "refund"],
        required: true,
    },
    externalId:
    {
        type : mongoose.Schema.Types.ObjectId
    },
    amount:
    {
        type : Number,
        required: true
    }
})

export const walletmodel = mongoose.model("wallets",walletSchema);