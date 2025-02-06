import mongoose from "mongoose";

const {Schema, model} = mongoose;

const storeOTPschema = new Schema({
    
})

export const StoreOTPmodel = model('StoreOTP', storeOTPschema)