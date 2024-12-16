const { isAdmin } = require('../../middlewares/auth');
const categoryRoutes = require("express").Router();
const { upload } = require("../../middlewares/cloudinary");


const { 
    getCategories,
    createCategory,
    getCategoryById,
    exportCategoriesToCsv
} = require("../controllers/category");


categoryRoutes.post("/create-category", upload.single('img'), createCategory);
categoryRoutes.get("/categories", getCategories);
categoryRoutes.get('/category/:id', getCategoryById);
categoryRoutes.get("/categories", getCategories);
categoryRoutes.get('/categories/export/csv', [isAdmin], exportCategoriesToCsv);

module.exports =  categoryRoutes;