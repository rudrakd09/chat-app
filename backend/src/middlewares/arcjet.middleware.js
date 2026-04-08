import aj from "../lib/arcjet.js";
import {isSpoofedBot}  from "@arcjet/inspect"

export const arcjetProtection = async( req, res ,next ) => {

    try{
        const decision = await aj.protect(req)

        if(decision.isDenied()){
            if( decision.reason.isRateLimit()){
                return res.status(429).json({message : "Rate limit exceeded. Please try again later."});
            } else if(decision.reason.isBot()){
                return res.status(403).json({message : "Bot access denied."});
            } else {
                return res.status(403).json({message : "Access denied by security policy."});
            }
        }

        // check for spoofedBots  
        if( decision.results.some(isSpoofedBot)){  //instead of some can also use for loop
            return res.status(403).json({
                error : "Detected spoofed bot.",
                message : "Detected Malicious bot activity"})
        }
        next();
    
    }catch(err){
        console.log("Arcjet Protection Error :",err)
        next();
    }

}