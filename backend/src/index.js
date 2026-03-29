import express from "express"
import authRoutes from "./routes/auth.route.js";
import dotenv from 'dotenv';
import { connectDB } from "./lib/db.js";
import path from "path";



dotenv.config();  // packged is used so that we can use var in .env 

const app = express();
const PORT = process.env.PORT || 3000 ;

 
app.use(express.json()) ;// alllow us to extract the json data out of req  body
app.use("/api/auth" , authRoutes  )


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
