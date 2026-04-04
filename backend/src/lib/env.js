import dotenv from "dotenv"
dotenv.config(); 

const ENV  =  {
    PORT :  process.env.PORT || 3000,
    MONGODB_URL  :  process.env.MONGODB_URL,
    JWT_SECRET :  process.env.JWT_SECRET,
    NODE_ENV : process.env.NODE_ENV,
    RESEND_API_KEY: process.env.RESEND_API_KEY,

    EMAIL_FROM : process.env.EMAIL_FROM,
    EMAIL_FROM_NAME : process.env.EMAIL_FROM_NAME,
    CLIENT_URL : process.env.CLIENT_URL,
    CLOUDINARY_CLOUD_NAME  :   process.env.CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY : process.env.CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET :   process.env.CLOUDINARY_API_SECRET,
}

export default ENV // if we do this -->> import ENV from "./env.js"
// else if export const ENV -->> import {ENV} yeh diff hain

