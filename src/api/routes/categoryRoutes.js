const { isAdmin } = require('../../middlewares/auth');
const categoryRoutes = require("express").Router();
const { upload } = require("../../middlewares/cloudinary");


const { 
    getCategories,
    createCategory,
    getCategoryById,
    exportCategoriesToCsv,
    updateCategoryById,
    deleteCategory
} = require("../controllers/category");


categoryRoutes.get("/categories", getCategories);
categoryRoutes.get('/category/:id', getCategoryById);
categoryRoutes.post("/create-category",  [isAdmin], upload.single('img'), createCategory);
categoryRoutes.get('/categories/export/csv', [isAdmin], exportCategoriesToCsv);
categoryRoutes.patch('/update-category/:id', [isAdmin], upload.single('img'), updateCategoryById);
categoryRoutes.delete('/delete-category/:id',[isAdmin], deleteCategory);

module.exports =  categoryRoutes;