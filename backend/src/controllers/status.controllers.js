import cloudinary from "../lib/cloudinary.js";
import Status from "../models/status.models.js";
import Message from "../models/message.models.js";

const uploadStatus = async (req, res) => {
  try {
    const { image, text } = req.body;
    const userId = req.user._id;

    if (!image) {
      return res.status(400).json({ message: "Image is required for a status." });
    }

    const uploadResponse = await cloudinary.uploader.upload(image);
    const imageUrl = uploadResponse.secure_url;

    const newStatus = new Status({
      userId,
      imageUrl,
      text,
    });

    await newStatus.save();
    
    await newStatus.populate("userId", "-password");

    res.status(201).json(newStatus);
  } catch (error) {
    console.log("Error in uploadStatus controller: ", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getStatuses = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;

    const messages = await Message.find({
      $or: [{ senderId: loggedInUserId }, { receiverId: loggedInUserId }],
    });

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
    
    // allow the user to also see their own active statuses
    chatPartnerIds.push(loggedInUserId.toString());

    const activeStatuses = await Status.find({ userId: { $in: chatPartnerIds } })
      .populate("userId", "-password")
      .sort({ createdAt: 1 });

    res.status(200).json(activeStatuses);
  } catch (error) {
    console.error("Error in getStatuses: ", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export { uploadStatus, getStatuses };
