//const { isAuth, isAdmin } = require('../../middlewares/auth');
const blogRoutes = require("express").Router();
const { upload } = require("../../middlewares/cloudinary");


const { 
    createBlogPost,
} = require("../controllers/blogpost");


blogRoutes.post("/create-post", upload.single('img'), createBlogPost);


module.exports =  blogRoutes;