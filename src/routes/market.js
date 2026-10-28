import express from 'express';
import { authmiddleware } from '../middleware/authmiddlware.js';
import { validate } from '../middleware/validate.js';
import { betZshema, marketZschema } from '../types/market.js';
import { getbets, getmarket, postbet, postmarket, profile, transcations } from '../controllers/market.js';
const router = express.Router();

// Market routes
router.post("/market", validate(marketZschema), authmiddleware, postmarket);
router.get("/market", authmiddleware, getmarket);

// Bet routes
router.post("/bet", validate(betZshema), authmiddleware, postbet);
router.get("/bets", authmiddleware, getbets);

// Profile route 
router.get("/profile", authmiddleware, profile);

// transactions routes
router.get("/transactions", authmiddleware, transcations);

export default router;