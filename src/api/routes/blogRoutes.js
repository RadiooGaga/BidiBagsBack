//const { isAuth, isAdmin } = require('../../middlewares/auth');
const blogRoutes = require("express").Router();
const { upload } = require("../../middlewares/cloudinary");


const { 
    getAllPosts,
    getLatestPost,
    createBlogPost,
} = require("../controllers/blog");


blogRoutes.post("/create-post", upload.single('img'), createBlogPost);
blogRoutes.get("/latest-post", getLatestPost);
blogRoutes.post("/blog", getAllPosts);

module.exports =  blogRoutes;