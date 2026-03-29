import { generateToken } from "../lib/utils.js";
import User from "../models/user.models.js";
import bcrypt from "bcryptjs";

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
      generateToken(newUser._id , res) // ig this id is which it is stored by in database   
      await newUser.save();

      res.status(201).json({
      _id: newUser._id,
      fullName: newUser.fullName,
      email: newUser.email,
      profilePic: newUser.profilePic,
      });

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

const login = (req, res) => {
  res.json({ message: "login route" });
};

const logout = (req, res) => {
  res.json({ message: "logout route" });
};

export { signup, login, logout };


