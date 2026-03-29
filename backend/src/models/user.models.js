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
        }
    },
    {
        timestamps : true     // createdAT & UpdatedAt
    }
)

const User =  mongoose.model("User" , userSchema)
export default User;