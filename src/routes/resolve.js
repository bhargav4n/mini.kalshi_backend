import express from 'express';
import { authmiddleware } from '../middleware/authmiddlware.js';
import { validate } from '../middleware/validate.js';
import { resolveZschema } from '../types/resolve.js';
import { resolvemarket } from '../controllers/resolve.js';

const router = express.Router();

router.post("/resolve", authmiddleware, validate(resolveZschema), resolvemarket);

export default router;