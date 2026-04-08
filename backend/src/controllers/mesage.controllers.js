import cloudinary from "../lib/cloudinary.js";
import Message from "../models/message.models.js";
import User from "../models/user.models.js";
import ScheduledMessage from "../models/scheduledMessage.models.js";
import { ai } from "../lib/gemini.js";
import { getReceiverSocketId, io } from "../lib/socket.js";
import Group from "../models/group.models.js";

const getAllContacts = async (req , res)=>{

   try {
     const LoggedInUserId = req.user._id;
     const filteredUsers  = await User.find( {_id  : { $ne : LoggedInUserId}}).select("-password")
 
     res.status(200).json(filteredUsers)

   } catch (error) {
        console.log("Error in getAllContacts :",error );
        res.status(500).json({message : "Server Error"})
   }
}


const getMessagesByUserId  = async (req,res) =>{
    try{
        const myId = req.user._id   //receiver id as per our data base 
        const {id : userToChatId} = req.params // this id came from router.get("/:id" , getMessagesByUserId); it we set idx then const {idx}

        // Check if id is a group
        const group = await Group.findById(userToChatId);
        if (group) {
             const groupMessages = await Message.find({ groupId: group._id }).sort({ createdAt: 1 });
             return res.status(200).json(groupMessages);
        }

        // me and you 
        // i send you messages 
        //  u send me messages 
        const AllMessages = await Message.find({
            $or  : [
                {senderId : myId ,  receiverId : userToChatId} ,
                {senderId : userToChatId,  receiverId : myId} 
            ]
        })

        res.status(200).json(AllMessages)
    }catch(error){
        console.log("Error in getMessagesByUserId  :",error );
        res.status(500).json({message : "Internal Server Error"})
    }
}


const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: targetId } = req.params;
    const senderId = req.user._id;

    if (!text && !image) {
      return res.status(400).json({ message: "Text or image is required." });
    }

    let imageUrl;
    if (image) {
      // upload base64 image to cloudinary
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    // Determine if target is Group or User
    const group = await Group.findById(targetId);
    let newMessage;

    if (group) {
        newMessage = new Message({
            senderId,
            groupId: group._id,
            text,
            image: imageUrl,
        });
        await newMessage.save();

        // Broadcast to all group members except sender
        group.members.forEach(memberId => {
            if (memberId.toString() !== senderId.toString()) {
                const memberSocketId = getReceiverSocketId(memberId.toString());
                if (memberSocketId) {
                    io.to(memberSocketId).emit("newMessage", newMessage);
                }
            }
        });

        return res.status(201).json(newMessage);
    }

    // Otherwise, treat as User
    if (senderId.equals(targetId)) {
      return res.status(400).json({ message: "Cannot send messages directly to yourself." });
    }
    const receiver = await User.findById(targetId);
    if (!receiver) {
      return res.status(404).json({ message: "Receiver securely not found." });
    }

    newMessage = new Message({
      senderId,
      receiverId: targetId,
      text,
      image: imageUrl,
    });

    await newMessage.save();

    // Broadcast in real-time securely using websockets
    const receiverSocketId = getReceiverSocketId(targetId.toString());
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    // Fire & Forget: Securely trigger Gemini AI Assistant autonomously if the target is the robot
    if (receiver.email === "ai@chatify.com" && ai && text) {
      setTimeout(async () => {
         try {
            const userSocketId = getReceiverSocketId(senderId.toString());
            
            // Broadcast that the AI is typing to vastly improve UX during slow generations
            if (userSocketId) {
               io.to(userSocketId).emit("typing", { userId: receiver._id });
            }

            const prompt = `You are an incredibly helpful, extremely concise, friendly AI chat assistant named Chatify AI. Keep answers strictly brief (1-3 sentences maximum) and suitable for a text messaging interface.\nUser: ${text}`;
            const geminiRes = await ai.models.generateContent({ model: "gemini-2.5-flash", contents: prompt });
            
            const aiMessage = new Message({
               senderId: receiver._id,
               receiverId: senderId,
               text: geminiRes.text,
            });
            await aiMessage.save();
            
            // Broadcast the AI response seamlessly using websockets
            if (userSocketId) {
               io.to(userSocketId).emit("stopTyping", { userId: receiver._id });
               io.to(userSocketId).emit("newMessage", aiMessage);
            }
         } catch (e) {
            console.error("Native Chatify AI strictly failed to securely respond:", e.message);
            const userSocketId = getReceiverSocketId(senderId.toString());
            if (userSocketId) {
               io.to(userSocketId).emit("stopTyping", { userId: receiver._id });
            }
         }
      }, 500); // 500ms hesitation to realistically simulate typing delay
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage controller: ", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getChatPartners = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;

    const messages = await Message.find({
      $or: [{ senderId: loggedInUserId }, { receiverId: loggedInUserId }],
    }).sort({ createdAt: -1 }); // sort descending to guarantee recency order

    // Note: Group messages only have groupId, not receiverId.
    const chatPartnerIds = [
      ...new Set(
        messages
          .filter((msg) => !msg.groupId) // Exclude group messages directly
          .map((msg) =>
            msg.senderId.toString() === loggedInUserId.toString()
              ? msg.receiverId.toString()
              : msg.senderId.toString()
          )
      ),
    ];

    const chatPartners = await User.find({ _id: { $in: chatPartnerIds } }).select("-password");
    
    // Sort the chatPartners according to the chronological extracted order
    chatPartners.sort((a, b) => chatPartnerIds.indexOf(a._id.toString()) - chatPartnerIds.indexOf(b._id.toString()));

    res.status(200).json(chatPartners);
  } catch (error) {
    console.error("Error in getChatPartners: ", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};


const scheduleMessage = async (req, res) => {
  try {
    const { text, image, scheduledAt } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    if (!text && !image) {
      return res.status(400).json({ message: "Text or image is required." });
    }
    if (!scheduledAt) {
      return res.status(400).json({ message: "scheduledAt time is required." });
    }
    
    const scheduleDate = new Date(scheduledAt);
    if (scheduleDate <= new Date()) {
       return res.status(400).json({ message: "Scheduled time must be in the future." });
    }

    if (senderId.equals(receiverId)) {
      return res.status(400).json({ message: "Cannot send messages to yourself." });
    }
    const receiverExists = await User.exists({ _id: receiverId });
    if (!receiverExists) {
      return res.status(404).json({ message: "Receiver not found." });
    }

    let imageUrl;
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = new ScheduledMessage({
      senderId,
      receiverId,
      text,
      image: imageUrl,
      scheduledAt: scheduleDate,
    });

    await newMessage.save();

    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in scheduleMessage controller: ", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const clearChat = async (req, res) => {
    try {
        const myId = req.user._id;
        const targetId = req.params.id;

        const group = await Group.findById(targetId);
        if (group) {
             await Message.deleteMany({ groupId: group._id });
        } else {
             await Message.deleteMany({
                 $or: [
                     { senderId: myId, receiverId: targetId },
                     { senderId: targetId, receiverId: myId }
                 ]
             });
        }
        res.status(200).json({ message: "Chat cleared globally." });
    } catch (e) {
        console.error("Error clearing chat:", e.message);
        res.status(500).json({ message: "Server error" });
    }
};

export const getChatMedia = async (req, res) => {
    try {
        const myId = req.user._id;
        const targetId = req.params.id;
        let messages = [];

        // Validate image exists and is not an empty string or null.
        const imageFilter = { image: { $exists: true, $ne: null, $nin: [""] } };

        const group = await Group.findById(targetId);
        if (group) {
             messages = await Message.find({ groupId: group._id, ...imageFilter }).sort({ createdAt: -1 });
        } else {
             messages = await Message.find({
                 $or: [
                     { senderId: myId, receiverId: targetId },
                     { senderId: targetId, receiverId: myId }
                 ],
                 ...imageFilter
             }).sort({ createdAt: -1 });
        }
        
        res.status(200).json(messages);
    } catch (e) {
        console.error("Error extracting media:", e.message);
        res.status(500).json({ message: "Server error" });
    }
};

const toggleStarMessage = async (req, res) => {
    try {
        const myId = req.user._id;
        const targetMessageId = req.params.id;

        const user = await User.findById(myId);
        if (!user.starredMessages) user.starredMessages = [];

        const hasStarred = user.starredMessages.some(id => id.toString() === targetMessageId);

        if (hasStarred) {
            user.starredMessages = user.starredMessages.filter(id => id.toString() !== targetMessageId);
        } else {
            user.starredMessages.push(targetMessageId);
        }
        
        await user.save();
        res.status(200).json(user.starredMessages);
    } catch (e) {
        console.error("Error starring message:", e.message);
        res.status(500).json({ message: "Server error" });
    }
};

const deleteMessage = async (req, res) => {
    try {
        const myId = req.user._id;
        const msgId = req.params.id;

        const message = await Message.findById(msgId);
        if (!message) return res.status(404).json({ message: "Message not found" });

        if (message.senderId.toString() !== myId.toString()) {
            return res.status(403).json({ message: "You can only delete your own messages" });
        }

        if (message.image) {
            const publicId = message.image.split("/").pop().split(".")[0];
            await cloudinary.uploader.destroy(publicId);
        }

        await Message.findByIdAndDelete(msgId);

        // Broadcast deletion event recursively
        if (message.groupId) {
            const group = await Group.findById(message.groupId);
            if (group) {
                group.members.forEach(memberId => {
                    if (memberId.toString() !== myId.toString()) {
                        const socketId = getReceiverSocketId(memberId.toString());
                        if (socketId) io.to(socketId).emit("messageDeleted", msgId);
                    }
                });
            }
        } else {
            const partnerId = message.senderId.toString() === myId.toString() ? message.receiverId.toString() : message.senderId.toString();
            const partnerSocketId = getReceiverSocketId(partnerId);
            if (partnerSocketId) io.to(partnerSocketId).emit("messageDeleted", msgId);
        }
        
        res.status(200).json({ message: "Message deleted successfully", _id: msgId });
    } catch (error) {
        console.error("Error in deleteMessage controller:", error.message);
        res.status(500).json({ message: "Server Error" });
    }
};

export  {
    getAllContacts,
    getMessagesByUserId,
    sendMessage,
    scheduleMessage,
    getChatPartners,
    toggleStarMessage,
    deleteMessage
}

