const mongoose = require("mongoose");

/*
mongoose.set('strict', false); 
mongoose.set('strictQuery', false); 
mongoose.set('strictPopulate', false);*/


const productSchema = new mongoose.Schema(
  {
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    collectionId: { type: mongoose.Schema.Types.ObjectId, ref: "Collection", required: true },
    categoryName: { type: String, required: true }, 
    collectionName: { type: String, required: true }, 
    img: { type: String, required: true },
    price: { type: Number, required: true },
    inStock: { type: Boolean, required: true },
    description: { type: String, required: true },
    details: { type: String, required: true },
    //rating: { type: Number, required: true },
    
  },
  {
    timestamps: true,
    collection: "BidiProducts",
    
  }
);

const Product = mongoose.model("Product", productSchema, "BidiProducts");
module.exports = Product;
