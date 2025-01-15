const mongoose = require("mongoose");

/*
mongoose.set('strict', false); 
mongoose.set('strictQuery', false); 
mongoose.set('strictPopulate', false);*/


const collectionSchema = new mongoose.Schema(
  {
    collectionName: { type: String, unique: true, required: true },
    img: { type: String, required: true },
    visible: { type: Boolean, default: true },
    products: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }] 
    
  },
  {
    timestamps: true,
    collection: "Collections",
  }
  
);

// Middleware para convertir el título a minúsculas antes de guardar
collectionSchema.pre('save', function (next) {
  if (this.collectionName) {
    this.collectionName = this.collectionName.toLowerCase(); 
  }
  next();
});

const Collection= mongoose.model("Collection", collectionSchema, "Collections");
module.exports = Collection;