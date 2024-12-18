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


categoryRoutes.post("/create-category", upload.single('img'), createCategory);
categoryRoutes.get("/categories", getCategories);
categoryRoutes.get('/category/:id', getCategoryById);
categoryRoutes.get('/categories/export/csv', [isAdmin], exportCategoriesToCsv);
categoryRoutes.patch('/update-category/:id', upload.single('img'), updateCategoryById);
categoryRoutes.delete('/delete-category/:id', deleteCategory);

module.exports =  categoryRoutes;