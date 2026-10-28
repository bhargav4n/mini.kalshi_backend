import mongoose from "mongoose";

// Create a Schema and Model object
const userSchema = new mongoose.Schema({
    username : 
    {
        type : String,
        required : true,
        trim : true,
        unique : true
    },
    password : 
    {
        type : String,
        trim : true
    },  
    balance: {
        type: Number,
        default: 0,
  },
});

export const usermodel = mongoose.model("user",userSchema);