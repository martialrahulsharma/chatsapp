import mongoose from "mongoose";

const { Schema, model } = mongoose;

const unreadMessageSchema = new Schema({
  user: { type: String },
  senderMessage: [{
    sender: String,
    message: [
      {
        sender: { type: String },
        message: { type: String },
        timestamp: { type: Date, default: Date.now },
        isRead: { type: Boolean, default: false },
      },
    ],
  }],
});

export const unreadMessageModel = model("UnreadMessage", unreadMessageSchema);
