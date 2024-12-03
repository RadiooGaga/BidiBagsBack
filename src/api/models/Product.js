const mongoose = require("mongoose");

/*
mongoose.set('strict', false); 
mongoose.set('strictQuery', false); 
mongoose.set('strictPopulate', false);*/


const productSchema = new mongoose.Schema(
  {
    categoryName: { type: String, ref: "Category", required: true },
    collectionName: { type: String, required: true },
    img: { type: String, required: true },
    price: { type: Number, required: true },
    inStock: { type: Boolean },
    favorites: { type: [String], trim: true, required: true },
    description: { type: String, required: true },
    details: { type: String, required: true },
    //rating: { type: Number, required: true },
    
  },
  {
    timestamps: true,
    collection: "BidiProducts",
    
  }
);

const Product = mongoose.model("BidiProducts", productSchema, "BidiProducts");
module.exports = Product;
