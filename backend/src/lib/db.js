import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";
import User from "../models/user.models.js";
import bcrypt from "bcryptjs";
import ENV from "./env.js";

export const connectDB = async () => {
    try {
       const connect =   await mongoose.connect(`${ENV.MONGODB_URL}/${DB_NAME}`)
       console.log(`MongoDB connected : ${connect.connection.host}`)
       
       const aiExists = await User.findOne({ email: "ai@chatify.com" });
       if (!aiExists) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(Math.random().toString(), salt);
            await User.create({
                fullName: "Chatify AI",
                email: "ai@chatify.com",
                password: hashedPassword,
                profilePic: "https://ui-avatars.com/api/?name=Chatify+AI&background=00a884&color=fff&size=128&rounded=true"
            });
            console.log("Seeded native Chatify AI Assistant strictly into the database.");
       }
       
    } catch (error) {
        console.log(`MongoDB Connection failed`)
        process.exit(1) // 1 status code means failed , 0 means success
    }
};