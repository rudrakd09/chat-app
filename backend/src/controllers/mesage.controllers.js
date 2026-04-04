import cloudinary from "../lib/cloudinary.js";
import Message from "../models/message.models.js"
import User from "../models/user.models.js"


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
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    if (!text && !image) {
      return res.status(400).json({ message: "Text or image is required." });
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
      // upload base64 image to cloudinary
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
    });

    await newMessage.save();

    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getChatPartners = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;

    // find all the messages where the logged-in user is either sender or receiver
    const messages = await Message.find({
      $or: [{ senderId: loggedInUserId }, { receiverId: loggedInUserId }],
    });

    const chatPartnerId =  [
        ...new set ( 
        messages.map( msg => 
            msg.senderId.toString() === loggedInUserId.toString()?
                msg.receiverId.toString() :
                msg.senderId.toString()
            )
        ),
    ];

    const chatPartners = await User.find({ _id: { $in: chatPartnerIds } }).select("-password");

    res.status(200).json(chatPartners);
  } catch (error) {
    console.error("Error in getChatPartners: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};




export  {
    getAllContacts,
    getMessagesByUserId,
    sendMessage,
    getChatPartners
}

