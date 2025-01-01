import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const signupSchema = new Schema({
  _id: Schema.Types.ObjectId,
  name: {type: String, required: true},
  username: {type: String, required: true, unique: true},
  password: {type: String, required: true},  
});


export const SignupModel = model('Signup', signupSchema);
