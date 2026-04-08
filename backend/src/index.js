import express from "express"
import path from "path"
import cors from "cors"
import authRoutes from "./routes/auth.route.js";
import ENV from "./lib/env.js"
import { connectDB } from "./lib/db.js";
// import path from "path";
import cookieParser from "cookie-parser"
import messageRoutes from "./routes/message.route.js"
import statusRoutes from "./routes/status.route.js"
import aiRoutes from "./routes/ai.route.js"
import groupRoutes from "./routes/group.route.js"
import "./lib/scheduler.js";




import { app, server } from "./lib/socket.js";
const __dirname  = path.resolve();

const PORT = ENV.PORT || 3000 ;

 
app.use(express.json({ limit: "50mb" })) ;// allow us to extract the json data out of req body
app.use(cors({origin : ENV.CLIENT_URL , credentials: true }))
app.use(cookieParser())


app.use("/api/auth" , authRoutes  )
app.use("/api/messages", messageRoutes)
app.use("/api/statuses", statusRoutes)
app.use("/api/ai", aiRoutes)
app.use("/api/groups", groupRoutes)


// make ready for the deployment 
if (ENV.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get(/.*/, (_, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  });
}
  
const startServer = async () => {
  try {
    await connectDB();
    server.listen(PORT, () => {
      console.log("Server is running on PORT", PORT);
    });
  } catch (error) {
    console.error("Failed to start server ", error);
    process.exit(1);
  }
};

startServer();
