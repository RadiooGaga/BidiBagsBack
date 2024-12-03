const mongoose = require("mongoose");

/*
mongoose.set('strict', false); 
mongoose.set('strictQuery', false); 
mongoose.set('strictPopulate', false);*/


const categorySchema = new mongoose.Schema(
  {
    categoryName: { type: String, unique: true, required: true },
    img: { type: String, required: true },
    visible: { type: Boolean },
    
  },
  {
    timestamps: true,
    collection: "Categories",
  }
  
);

// Middleware para convertir el título a mayúsculas antes de guardar
categorySchema.pre('save', function (next) {
  if (this.category) {
    this.category = this.category.toUpperCase(); 
  }
  next();
});

const Category = mongoose.model("Categories", categorySchema, "Categories");
module.exports = Category;