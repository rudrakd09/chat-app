import express from "express"
import authRoutes from "./routes/auth.route.js";
import ENV from "./lib/env.js"
import { connectDB } from "./lib/db.js";
import path from "path";
import cookieParser from "cookie-parser"
import messageRoutes from "./routes/message.route.js"




const app = express();
const PORT = ENV.PORT || 3000 ;

 
app.use(express.json()) ;// alllow us to extract the json data out of req  body
app.use(cookieParser())


app.use("/api/auth" , authRoutes  )
app.use("/api/messages", messageRoutes)
  
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log("Server is running on PORT", PORT);
    });
  } catch (error) {
    console.error("Failed to start server ❌", error);
    process.exit(1);
  }
};

startServer();
