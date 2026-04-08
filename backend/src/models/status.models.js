import mongoose from "mongoose";

const statusSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    text: {
      type: String,
      trim: true,
      maxlength: 300,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 86400, // MongoDB TTL index: automatically deletes document after 24 hours (86400 seconds)
    },
  }
);

const Status = mongoose.model("Status", statusSchema);

export default Status;
