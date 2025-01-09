import mongoose from "mongoose";

const {Schema, model} = mongoose;

const notificationSchema = new Schema({
    username: {type: String},
    notificationList: [{
        username: {type: String},
        // name: {type: String},
        date: {type: Date, default: Date.now},
        _id: false,
    }]
});

export const notificationSchemaModel = model("Notification", notificationSchema);