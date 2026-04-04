import jwt from "jsonwebtoken"
import User from "../models/user.models.js"
import ENV from "../lib/env.js"

const protectRoute = async (req ,res, next ) => { 
    try {
        const token = req.cookies.jwt 

        if(!token) return res.status(401).json({message :"Unauthorized-No token provided"})

        const decoded = jwt.verify(token , ENV.JWT_SECRET)
        if(!decoded) return res.status(401).json({message :"Unauthorized-Invalid token"})

        const user = await User.findById(decoded.userId).select("-password")
        if(!user ) return res.status(404).json({message :"User Not found"})

        // we add a custom field to req as user so that we can use it in next function
        req.user = user
        next()

    } catch (err) {
        console.log("Error in protectRoutr middleware :", err);
        res.status(500).json({message :"Internal Server Error"})
    }

}





export  { protectRoute}