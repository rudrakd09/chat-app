 import express from "express"
 import {signup,login,logout,updateProfile, toggleBlockUser, toggleFavoriteUser } from "../controllers/auth.controllers.js"
 import {protectRoute} from "../middlewares/auth.middleware.js"
 import {arcjetProtection} from "../middlewares/arcjet.middleware.js"

 const router = express.Router()

 router.use(arcjetProtection);

 router.post("/signup" , signup)
 
 router.post("/login" ,  login)
 
 router.post("/logout" , logout)

 router.put("/update-profile",protectRoute, updateProfile)

 router.post("/block/:id", protectRoute, toggleBlockUser)
 router.post("/favorite/:id", protectRoute, toggleFavoriteUser)

 router.get("/check" , protectRoute , (req,res)=> res.status(200).json(req.user));
 
 export default router; 