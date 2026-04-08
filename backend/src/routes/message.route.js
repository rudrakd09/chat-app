import express from "express"
import { getAllContacts , getMessagesByUserId , sendMessage , scheduleMessage, getChatPartners, clearChat, getChatMedia, toggleStarMessage, deleteMessage} from "../controllers/mesage.controllers.js";
import { protectRoute } from "../middlewares/auth.middleware.js";
import { arcjetProtection } from "../middlewares/arcjet.middleware.js";
const router = express.Router();


// the middlewares execute in order - so requests get rate-limited first, then authenticated.
// this is actually more efficient since unauthenticated requests get blocked by rate limiting before hitting the auth middleware.
router.use( arcjetProtection,protectRoute);  

router.get("/contacts" ,  getAllContacts);
router.get("/chats" ,  getChatPartners );
router.get("/media/:id" , getChatMedia);
router.get("/:id" ,  getMessagesByUserId);
router.post("/send/:id"  ,sendMessage );
router.post("/schedule/:id"  ,scheduleMessage );
router.post("/star/:id", toggleStarMessage);
router.delete("/clear/:id", clearChat);
router.delete("/delete/:id", deleteMessage);

export default router;