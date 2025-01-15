const mongoose = require("mongoose");

/*
mongoose.set('strict', false); 
mongoose.set('strictQuery', false); 
mongoose.set('strictPopulate', false);*/


const categorySchema = new mongoose.Schema(
  {
    categoryName: { type: String, unique: true, required: true },
    img: { type: String, required: true },
    visible: { type: Boolean, default: true },
    products: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }] 
  },
  {
    timestamps: true,
    collection: "Categories",
  }
  
);

// Middleware para convertir el título a minúsculas antes de guardar
categorySchema.pre('save', function (next) {
  if (this.categoryName) {
    this.categoryName = this.categoryName.toLowerCase(); 
  }
  next();
});

const Category = mongoose.model("Category", categorySchema, "Categories");
module.exports = Category;