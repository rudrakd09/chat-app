import cron from "node-cron";
import ScheduledMessage from "../models/scheduledMessage.models.js";
import Message from "../models/message.models.js";
import { getReceiverSocketId, io } from "./socket.js";

// Run every minute
cron.schedule("* * * * *", async () => {
  try {
    const now = new Date();
    
    // Find messages that are scheduled for now or in the past
    const dueMessages = await ScheduledMessage.find({
      scheduledAt: { $lte: now },
    });

    if (dueMessages.length > 0) {
      console.log(`Processing ${dueMessages.length} scheduled messages...`);
      
      for (const msg of dueMessages) {
        // Convert to regular Message
        const newMessage = new Message({
          senderId: msg.senderId,
          receiverId: msg.receiverId,
          text: msg.text,
          image: msg.image,
          createdAt: msg.scheduledAt, // Use the scheduled time instead of now if beneficial
        });

        await newMessage.save();

        // Emit real-time event to the receiver
        const receiverSocketId = getReceiverSocketId(msg.receiverId.toString());
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("newMessage", newMessage);
        }

        // Emit real-time event back to the sender so their UI updates
        const senderSocketId = getReceiverSocketId(msg.senderId.toString());
        if (senderSocketId && senderSocketId !== receiverSocketId) {
          io.to(senderSocketId).emit("newMessage", newMessage);
        }

        // Delete the processed scheduled message
        await ScheduledMessage.findByIdAndDelete(msg._id);
      }
    }
  } catch (error) {
    console.error("Error running message scheduler:", error);
  }
});

console.log("Message Scheduler service started...");
