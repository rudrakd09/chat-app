import { sendWelcomeEmail } from "../emails/emailsHandlers.js";
import { generateToken } from "../lib/utils.js";
import User from "../models/user.models.js";
import bcrypt from "bcryptjs";
import ENV from "../lib/env.js"
import cloudinary from "../lib/cloudinary.js"

const signup = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    // check if email is  valid  : regex 
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    } 

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    //123456 - shafjbsdifb_?#%#
    const salt = await bcrypt.genSalt(10); // this determines how long the string is
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
    });

    if(newUser){
      const savedUser = await newUser.save();
      generateToken(savedUser._id , res) // ig this id is which it is stored by in database   
     

      res.status(201).json({
      _id: savedUser._id,
      fullName: savedUser.fullName,
      email: savedUser.email,
      profilePic: savedUser.profilePic,
      });


      try{
        await sendWelcomeEmail(savedUser.email , savedUser.fullName , ENV.CLIENT_URL )
      }catch(error){
        console.error("Failed to send the welcome error : ",error);
      }

    }else{
      res.status(400).json({
        message : "Invalid user data"
      })
    } 

  } catch (error) {
    console.error("error in signup controller:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

const login = async  (req, res) => {
  const {email , password } = req.body 

  try{
    const user = await User.findOne({email})
    if(!user) return res.status(400).json({message : "Invalid Credentials"})
      //  never tell the client which one is incorrect : password or email
    const isPasswordCorrect = await bcrypt.compare( password , user.password)

    if(!isPasswordCorrect) return res.status(400).json({message : "Invalid Credentials"})

    generateToken(user._id ,res)

    res.status(200).json({
      _id  :  user._id,
      fullName : user.fullName,
      email : user.email,
      profilePic : user.profilePic
    })
  }catch(err){
    console.log("Error in login controller :",err);
    res.status(400).json({message : "Internal server error"})
  }

  
};

// logout doesnt havr to be an asycn function and we dont need to use req 
const logout = (_, res) => {
  res.cookie("jwt","", {maxAge : 0 })
  res.status(200).json({message : "Logged out Succecssfully"})
}

const updateProfile = async (req ,res) => {
  try{
    const {profilePic, about, fullName} = req.body;
    const userId = req.user._id;

    if (!profilePic && about === undefined && fullName === undefined) {
       return res.status(400).json({message: "No valid fields provided for update"});
    }

    const updates = {};
    if (about !== undefined) updates.about = about;
    if (fullName !== undefined) updates.fullName = fullName;

    if (profilePic) {
       const uploadResponse = await cloudinary.uploader.upload(profilePic);
       updates.profilePic = uploadResponse.secure_url;
    }

    const updatedUser = await User.findByIdAndUpdate( userId,
      { $set: updates },
      { new: true }
    ).select("-password");

    res.status(200).json(updatedUser);

  } catch (err) {
    console.log("Error in update profile :",err);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export const toggleBlockUser = async (req, res) => {
    try {
        const myId = req.user._id;
        const targetId = req.params.id;

        const user = await User.findById(myId);
        if (!user.blockedUsers) user.blockedUsers = [];

        const hasBlocked = user.blockedUsers.some(id => id.toString() === targetId);

        if (hasBlocked) {
            user.blockedUsers = user.blockedUsers.filter(id => id.toString() !== targetId);
        } else {
            user.blockedUsers.push(targetId);
        }
        await user.save();
        
        res.status(200).json(user.blockedUsers);
    } catch (e) {
        console.log("Error inside toggleBlock:", e.message);
        res.status(500).json({ message: "Server error" });
    }
};

export const toggleFavoriteUser = async (req, res) => {
    try {
        const myId = req.user._id;
        const targetId = req.params.id;

        const user = await User.findById(myId);
        if (!user.favoriteUsers) user.favoriteUsers = [];

        const hasFavorited = user.favoriteUsers.some(id => id.toString() === targetId);

        if (hasFavorited) {
            user.favoriteUsers = user.favoriteUsers.filter(id => id.toString() !== targetId);
        } else {
            user.favoriteUsers.push(targetId);
        }
        await user.save();

        res.status(200).json(user.favoriteUsers);
    } catch (e) {
        console.log("Error inside toggleFavorite:", e.message);
        res.status(500).json({ message: "Server error" });
    }
};

export { signup, login, logout , updateProfile };


