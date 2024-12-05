//const { isAuth, isAdmin } = require('../../middlewares/auth');
const blogRoutes = require("express").Router();
const { upload } = require("../../middlewares/cloudinary");


const { 
    getAllPosts,
    createBlogPost,
} = require("../controllers/blog");


blogRoutes.post("/create-post", upload.single('img'), createBlogPost);
blogRoutes.post("/blog", getAllPosts);

module.exports =  blogRoutes;