import mongoose from "mongoose";

export const connectToDatabase = async ()=>{
    try{
        await mongoose.connect(process.env.MONGODB);
        console.log("DB is Connected");
    }catch(err){
        console.log("Error in connecting to Database");
        console.log(err);
    }
   
}