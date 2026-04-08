import mongoose from "mongoose";

const userSchema =new  mongoose.Schema(
    {
        email : {
            type : String,
            unique : true,
            required : true
        },
        fullName : {
            type : String,
            required : true
        },
        password : {
            type : String,
            minlength : 6,
            required : true
        },
        profilePic : {
            type : String,
            default : "",
        },
        phoneNumber: {
            type: String,
            default: "",
        },
        about: {
            type: String,
            default: "Hey there! I am using Chatify.",
        },
        blockedUsers: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        }],
        favoriteUsers: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        }],
        starredMessages: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Message",
        }]
    },
    {
        timestamps : true     // createdAT & UpdatedAt
    }
)

const User =  mongoose.model("User" , userSchema)
export default User;