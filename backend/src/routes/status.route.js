import express from "express"
import { uploadStatus, getStatuses} from "../controllers/status.controllers.js";
import { protectRoute } from "../middlewares/auth.middleware.js";
import { arcjetProtection } from "../middlewares/arcjet.middleware.js";

const router = express.Router();

router.use(arcjetProtection, protectRoute);  

router.post("/upload", uploadStatus);
router.get("/", getStatuses);

export default router;
