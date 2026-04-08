import Group from "../models/group.models.js";
import User from "../models/user.models.js";
import cloudinary from "../lib/cloudinary.js";
import Message from "../models/message.models.js";

export const createGroup = async (req, res) => {
  try {
    const { name, description, members, image } = req.body;
    const creatorId = req.user._id;

    if (!name || !members || members.length === 0) {
      return res.status(400).json({ message: "Group name and at least one member are required." });
    }

    let groupPicUrl = "";
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      groupPicUrl = uploadResponse.secure_url;
    }

    // Ensure the creator is in the members and admins list
    const memberIds = [...new Set([...members, creatorId.toString()])];

    const newGroup = new Group({
      name,
      description,
      groupPic: groupPicUrl,
      members: memberIds,
      admins: [creatorId],
      creatorId,
      onlyAdminsCanPost: false,
    });

    await newGroup.save();

    // Populate basic member info for the response
    const populatedGroup = await Group.findById(newGroup._id)
      .populate("members", "-password")
      .populate("admins", "-password");

    res.status(201).json(populatedGroup);
  } catch (error) {
    console.log("Error in createGroup controller: ", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getUserGroups = async (req, res) => {
  try {
    const userId = req.user._id;
    const groups = await Group.find({ members: userId })
      .populate("members", "-password")
      .populate("admins", "-password")
      .sort({ updatedAt: -1 });

    res.status(200).json(groups);
  } catch (error) {
    console.log("Error in getUserGroups controller: ", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateGroup = async (req, res) => {
    try {
        const { id } = req.params;
        const { action, targetUserId, image } = req.body; // Add/Remove members, etc.
        const userId = req.user._id;

        const group = await Group.findById(id);
        if (!group) return res.status(404).json({ message: "Group not found" });

        // Basic permission check - let users remove themselves or update group picture
        const isSelfRemoval = action === "remove_member" && targetUserId === userId.toString();
        const isUpdatingPic = action === "update_group_pic";
        if (!group.admins.includes(userId) && !isSelfRemoval && !isUpdatingPic) {
            return res.status(403).json({ message: "Only admins can modify the group." });
        }

        if (action === "add_member") {
            if (!group.members.includes(targetUserId)) {
                group.members.push(targetUserId);
            }
        } else if (action === "remove_member") {
            group.members = group.members.filter(m => m.toString() !== targetUserId);
            group.admins = group.admins.filter(a => a.toString() !== targetUserId);
        } else if (action === "toggle_admin_post") {
            group.onlyAdminsCanPost = !group.onlyAdminsCanPost;
        } else if (action === "update_group_pic" && image) {
            if (group.groupPic) {
                const publicId = group.groupPic.split("/").pop().split(".")[0];
                await cloudinary.uploader.destroy(publicId).catch(console.error);
            }
            const uploadResponse = await cloudinary.uploader.upload(image);
            group.groupPic = uploadResponse.secure_url;
        }

        await group.save();
        const updatedGroup = await Group.findById(group._id)
            .populate("members", "-password")
            .populate("admins", "-password");

        res.status(200).json(updatedGroup);
    } catch (e) {
        console.log("Error in updateGroup", e.message);
        res.status(500).json({ message: "Server error" });
    }
};

export const deleteGroup = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const group = await Group.findById(id);
        if (!group) return res.status(404).json({ message: "Group not found" });

        // Basic permission check - only creator or admin can delete
        if (!group.admins.includes(userId)) {
            return res.status(403).json({ message: "Only admins can delete the group." });
        }

        // Find and delete all messages with this group ID, and their cloudinary images if any exist
        const groupMessages = await Message.find({ groupId: group._id });
        for (const msg of groupMessages) {
            if (msg.image) {
                const publicId = msg.image.split("/").pop().split(".")[0];
                await cloudinary.uploader.destroy(publicId).catch(console.error);
            }
        }
        await Message.deleteMany({ groupId: group._id });

        if (group.groupPic) {
            const publicId = group.groupPic.split("/").pop().split(".")[0];
            await cloudinary.uploader.destroy(publicId).catch(console.error);
        }

        await Group.findByIdAndDelete(id);

        res.status(200).json({ message: "Group and all related messages securely deleted.", _id: id });
    } catch (e) {
        console.log("Error in deleteGroup", e.message);
        res.status(500).json({ message: "Server error" });
    }
};
