import jwt from "jsonwebtoken"
// import cookie from "cookie-parser"
import ENV from "./env.js"
   
export const generateToken = (userId ,res)=>{
    const token = jwt.sign({ userId} , ENV.JWT_SECRET, {
            expiresIn : "7d"
    })

    res.cookie("jwt" ,token , {
        maxAge : 7 * 24 * 60 * 60 * 1000  ,//MS ,
        httpOnly : true, // prevent XSS attack : cross site scripting
        sameSite : "strict", // prevent CSRF    attacks
        secure : ENV.MODE_ENV !== "development" // this secure field is true or false  
    })

    return token;
}