const mongoose = require("mongoose");

/*
mongoose.set('strict', false); 
mongoose.set('strictQuery', false); 
mongoose.set('strictPopulate', false);*/


const collectionSchema = new mongoose.Schema(
  {
    collectionName: { type: String, unique: true, required: true },
    img: { type: String, required: true },
    visible: { type: Boolean },
    products: [{ type: mongoose.Schema.Types.ObjectId, ref: "BidiProducts" }] 
    
  },
  {
    timestamps: true,
    collection: "Collections",
  }
  
);

// Middleware para convertir el título a mayúsculas antes de guardar
collectionSchema.pre('save', function (next) {
  if (this.collectionName) {
    this.collectionName = this.collectionName.toUpperCase(); 
  }
  next();
});

const Collection= mongoose.model("Collections", collectionSchema, "Collections");
module.exports = Collection;