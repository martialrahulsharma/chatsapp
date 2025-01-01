import mongoose from "mongoose";

const {Schema, model} = mongoose;

const messageSchema = new Schema({
    sender: {type: String},
    message: {type: String},
    timestamp: {type: Date, default: Date.now},
    isRead: {type: Boolean, default: false},
}, {_id: false});

const getChatsSchema = new Schema({
    roomId: {type: String, required: true},
    message: [messageSchema],
})

export const ChatRoomModel = model("ChatRoom", getChatsSchema);