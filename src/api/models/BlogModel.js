const mongoose = require("mongoose");

/*
mongoose.set('strict', false); 
mongoose.set('strictQuery', false); 
mongoose.set('strictPopulate', false);*/


const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    img: { type: String, required: true },
  },
  {
    timestamps: true,
    collection: "BlogEntries",
  }
);

const Post = mongoose.model("BlogEntries", blogSchema, "BlogEntries");
module.exports = Post;