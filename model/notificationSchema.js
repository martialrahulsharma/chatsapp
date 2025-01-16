import mongoose from "mongoose";

const {Schema, model} = mongoose;

const notificationSchema = new Schema({
    username: {type: String},
    notificationList: [{
        username: {type: String},
        userId: {type: String},
        timestamp: {type: Date, default: Date.now},
        _id: false,
    }]
});

export const notificationSchemaModel = model("Notification", notificationSchema);