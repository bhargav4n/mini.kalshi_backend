import { usermodel } from "../models/user.js";
import { marketmodel } from "../models/market.js";
import { betmodel } from "../models/bet.js";
import { walletmodel } from "../models/wallet.js";

// 10. POST Resolve : 
// 10.1 Market exists.
// 10.2 Caller is the creator, using .toString() or .equals().
// 10.3 Not already resolved: market.resolution !== null returns an error. This stops double payouts.
// 10.4 Resolution is valid: only "yes" or "no" (validate with Zod).
// 10.5 Market has expired: don’t allow resolving before expiry.
// 10.6 Edge case: if nobody bet, the creator just gets their full wager back.
export const resolvemarket = async(req, res)=>
{
    // req body containe marketId and resolution
    try
    {
        const user = req.user;
        // 10.1 Market exists.
        const existmarket = await marketmodel.findOne({_id : req.body.marketId});
        if(!existmarket)
            return res.status(400).json({message:"Market doesnt exists"});
        // 10.2 Caller is the creator, using .toString() or .equals().
        if(existmarket.creatorId.toString() != user._id.toString())
            return res.status(400).json({message:"Only creator can resolve"});
        // Check if the market is resolved or not
        if(existmarket.resolution!=null)
            return res.status(400).json({message:"Market is already resolved"});
        // Market has expired: don’t allow resolving before expiry.
        if(new Date() < existmarket.expiry)
            return res.status(400).json({message:"Market has not expired"});

        // Payout section :
        const marketId = req.body.marketId;
        const resolution = req.body.resolution;

        const bets = await betmodel.find({marketId : marketId}); // contains the array of all the bets
        let total_betamount = 0;
        for(const bet of bets)
            total_betamount = total_betamount + bet.amount;

        if(resolution===existmarket.side)
        {
            // Edge case: if nobody bet, the creator just gets their full wager back -> works even if total bets is zero
            // if the creator won
            const updatebal = existmarket.intialwager + total_betamount;
            await usermodel.updateOne({_id : user._id}, {$inc : {balance : updatebal}});
            await walletmodel.create({
                userId : user._id,
                tx_type : "payout",
                externalId : existmarket._id,
                amount : + updatebal
            })
        }
        else
        {
            // payouts to all the users who bet against the user
            // bets containes all the users who bet against the creators - update the balance only
            for(const bet of bets)
            {
                const payout = bet.amount * 2;
                await usermodel.updateOne({_id : bet.userId},{$inc : {balance : payout}});
                await walletmodel.create({
                    userId : bet.userId,
                    tx_type : "payout",
                    externalId : existmarket._id,
                    amount : + payout
                })
            }
            const unmatched = existmarket.intialwager - total_betamount;
            if(unmatched>0)
            {
                await usermodel.updateOne({_id : user._id},{$inc : {balance : unmatched}});
                await walletmodel.create({
                    userId : user._id,
                    tx_type : "refund",
                    externalId : existmarket._id,
                    amount : + unmatched
                })
            }
        }
        await marketmodel.updateOne({_id : existmarket._id},{resolution : resolution});
        // creator's unmatched refund: do it yourself, same pattern
        return res.status(200).json({message:"Resolved successfully"});
    }
    catch(error)
    {
        return res.status(500).json({error : error.message});
    }
}