//const { isAuth, isAdmin } = require('../../middlewares/auth');
const categoryRoutes = require("express").Router();
const { upload } = require("../../middlewares/cloudinary");


const { 
    getCategories,
    createCategory 
} = require("../controllers/category");


categoryRoutes.post("/create-category", upload.single('img'), createCategory);
categoryRoutes.get("/categories", getCategories);

module.exports =  categoryRoutes;