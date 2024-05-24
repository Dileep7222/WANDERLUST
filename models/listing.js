const mongoose=require("mongoose");
const Schema=mongoose.Schema;
const listingSchema =new Schema({
  title:{
    type:String,
    required:true,
  },
  description: String,
 image:{
    type:String,
    set:(v)=>v===" " ? "https://images.unsplash.com/photo-1683009427692-8a28348b0965?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDF8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D": v,
 },
 price:Number,
 location:String,
 country:String,
});

const listing=mongoose.model("listing",listingSchema);
module.exports=listing;