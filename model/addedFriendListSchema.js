import mongoose from "mongoose";

const {Schema, model} = mongoose;

const addedFriendListSchema = new Schema({
    userId: {type: mongoose.Schema.Types.ObjectId, ref: "Signup"},
    myFriendList: [{ type: Schema.Types.ObjectId, ref: 'Signup' }] // Array of references to other User documents
});

export const AddedFriendListModel = model("AddedFriendList", addedFriendListSchema);