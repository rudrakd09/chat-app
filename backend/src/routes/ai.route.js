import express from "express";
import { translateMessage } from "../controllers/ai.controllers.js";
import { protectRoute } from "../middlewares/auth.middleware.js";
import { arcjetProtection } from "../middlewares/arcjet.middleware.js";

const router = express.Router();

// Ensure translation endpoints are heavily protected
router.use(arcjetProtection, protectRoute);  

router.post("/translate", translateMessage);

export default router;
