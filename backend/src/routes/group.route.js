import express from "express";
import { protectRoute } from "../middlewares/auth.middleware.js";
import { arcjetProtection } from "../middlewares/arcjet.middleware.js";
import { createGroup, getUserGroups, updateGroup, deleteGroup } from "../controllers/group.controllers.js";

const router = express.Router();

router.use(arcjetProtection, protectRoute);

router.post("/create", createGroup);
router.get("/", getUserGroups);
router.put("/:id", updateGroup);
router.delete("/:id", deleteGroup);

export default router;
