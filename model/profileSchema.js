import mongoose from 'mongoose';
// import { SignupModel } from './signupSchema.js';

const { Schema, model } = mongoose;

const profileSchema = new Schema({
  name: {type: String, required: true,},  
  userId: {type: mongoose.Schema.Types.ObjectId, ref: "Signup"},
  img:{type: String},
  isLoggedIn: {type: Boolean},
});


export const ProfileSchema = model('Profile', profileSchema);
