import { betmodel } from "../models/bet.js";
import { marketmodel } from "../models/market.js";
import { usermodel } from "../models/user.js";
import { walletmodel } from "../models/wallet.js";

// 4. POST market data : 
// 4.1 authmiddleware -> req.user = existuser;
// 4.2 data in the market model -> title, intialwager, side, creatorID, expiry and resolution(is set to false intially)x
export const postmarket = async(req, res)=>
{
    const user = req.user; // contains the user documnet
    // user can only create a market if the balance >= intialwager if not put out an error
    if(user.balance<req.body.intialwager)
    {
        res.status(404).json({message:"Insufficient funds! Add funds."})
        return;
    }

    // if the user has sufficient funds then update the market DB
    const marketdata = await marketmodel.create({
        title : req.body.title,
        intialwager : req.body.intialwager,
        side : req.body.side,
        expiry : req.body.expiry,
        creatorId : req.user._id
    })

    const userwallet = await walletmodel.create({
        userId : user._id,
        tx_type : "created",
        externalId : marketdata._id,
        amount : - (req.body.intialwager)
    })

    // Decrement the balanace from the user model
    const remaining_bal = user.balance - (req.body.intialwager);

    await usermodel.updateOne({_id : user._id},{balance : remaining_bal});

    res.status(200).json({marketId : marketdata._id});
}


// 5. GET market : get all the markets associated with the User ID:
// 5.1 authmiddleware -> req.user = existuser;
// 5.2 data in the market model -> title, intialwager, side, creatorID, expiry and resolution(is set to false intially)x
export const getmarket = async (req,res) =>
{
    const userId = req.user._id;

    // Get all the market from the marketmodel
    const usermarkets = await marketmodel.find({ creatorId: userId }).select("title side intialwager");
    if(usermarkets.length == 0)
    {
        res.status(404).json({message:"No markets associated with the user"});
        return;
    }
    res.status(404).json(usermarkets);
}


// 6. POST bet
// 6.1 authmiddleware -> req.user = existuser;
// 6.2 Inputs from the user -> marketId and amount
export const postbet = async(req,res)=>
{
    // User cant place the bet if the market is not found
    // User cant place the bet if the bet amount is more than the intialwager
    // User cant place the bet if the bet amount exceeds the total_betamount = intialwager - (totalbets)
    // User cant place the bet if he is a creator
    // User cant place the bet if market has already expired
    // User cant place the bet if User's balance is less than the bet amount
    // Finally add the bet to the user's wallet and also to the wallet
    try
    {
        const user = req.user;
        const marketId = req.body.marketId;
        const bet_amount = req.body.amount;

        const marketdata = (await marketmodel.findOne({_id : marketId}));
        if(!marketdata)
        {
            res.status(400).json({message:"Market not found"});
            return
        }

        const intialwager = marketdata.intialwager;
        if(bet_amount>intialwager)
        {
            res.status(400).json({message:"Bet amount cant be more than wager"})
            return
        }

        if(marketdata.creatorId.toString() === user._id.toString())
        {
            res.status(400).json({message:"Creator cant place the bet on this market"})
            return
        }

        const existingbet = await betmodel.find({marketId}); // containes an array of all the bets with the market Id
        let total_betamount = 0;
        for(const bet of existingbet)
            total_betamount = total_betamount + bet.amount;
        const remaining_bet = marketdata.intialwager - total_betamount;
        if(bet_amount>remaining_bet)
        {
            res.status(400).json({message:"Bet amount exceeds the remaining bet amount"})
            return;
        }

        if(new Date()>marketdata.expiry)
             return res.status(400).json({ error: "Market has expired" });

        const usersbalance = user.balance;

        if(usersbalance<bet_amount)
        {
            return res.status(400).json({ error: "Insufficent balance" });
        }

        const userbet = await betmodel.create({
            userId : user._id,
            marketId : marketId,
            amount : bet_amount
        })

        // wallet model inputs -> userId, tx_type, externalId, amount
        const userwallet = await walletmodel.create({
            userId : user._id,
            tx_type : "bet",
            externalId : userbet._id,
            amount : - bet_amount
        })

        // update the balance
        let balance = user.balance - bet_amount;
        await usermodel.updateOne({_id : user._id},{balance : balance});

        res.status(200).json({betId:userbet._id})

    }
    catch(error)
    {
        return res.status(400).json({error: error.message});
    }
}


// 7. GET bets
// 7.1 authmiddleware -> req.user = existuser;
export const getbets = async(req,res)=>
{
    try
    {
        const user = req.user;
        const usersbet = await betmodel.find({userId : user._id}).select("marketId amount").populate("marketId","title");

        const bets = usersbet.map((b)=>({
            title : b.marketId.title,
            amount : b.amount
        }))
        return res.status(200).json({bets: bets});
    }
    catch(error)
    {
        return res.status(500).json({ error: error.message });
    }
}


// 8. GET profile : 
// 8.1 authmiddleware -> req.user = existuser;
export const profile = async(req,res) =>
{
    // Username
    // Balance (current wallet balance)
    // Markets created (title, side, wager, expiry, resolution)
    // Bets placed (market title, amount)
    // Transactions (type, amount)
    try
    {
        const user = req.user;
        // username and balance
        const username = req.user.username;
        const balanace = req.user.balance;
        // Markets created (title, side, wager, expiry, resolution)
        const usermarkets = await marketmodel.find({ creatorId: user._id }).select("title side intialwager");

        // Bets placed (market title, amount)
        const usersbet = await betmodel.find({userId : user._id}).select("marketId amount").populate("marketId","title");
        const bets = usersbet.map((b)=>({
            title : b.marketId.title,
            amount : b.amount
        }))
        // Transactions (type, amount)
        const userswallet = await walletmodel.find({userId : user._id}).select("tx_type amount").sort({_id:-1})
        const custom = userswallet.map((w)=>({
            txn_type : w.tx_type,
            amount : w.amount
        }))

        // response
        return res.status(200).json({
            username : username,
            balance : balanace,
            markets : usermarkets,
            bets : bets,
            wallet : custom
        })
    }
    catch(error)
    {
        res.status(500).json({error : error.message});
    }
}


// 9. GET transcations : 
// 9.1 authmiddleware -> req.user = existuser;
export const transcations = async(req,res)=>
{
    try
    {
        const user = req.user;
        // print all the trancations
        const userswallet = await walletmodel.find({userId : user._id}).select("tx_type amount").sort({_id:-1})

        const custom = userswallet.map((w)=>({
            txn_type : w.tx_type,
            amount : w.amount
        }))

        res.status(200).json({txns : custom});
    }
    catch(error)
    {
        return res.status(500).json({error : error.message});
    }
}