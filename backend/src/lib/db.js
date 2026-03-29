 import mongoose  from "mongoose";
import { DB_NAME } from "../constants.js";

export const connectDB = async () => {
    try {
       const connect =   await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
       console.log(`MongoDB connected : ${connect.connection.host}`)
    } catch (error) {
        console.log(`MongoDB Connection failed`)
        process.exit(1) // 1 status code means failed , 0 means success
    }
};