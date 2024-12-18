const { isAdmin } = require("../../middlewares/auth");
const productRoutes = require("express").Router();
const { upload } = require('../../middlewares/cloudinary')

// ------------------ ACORDARSE DE ISAUTH [isAuth] para alguas funcionalidades ----------

//CONTROLADORES DE PRODUCTOS

const { 
    getProducts, 
    getProductById, 
    getProductsByCategoryName, 
    createProductCard,
    exportProductsToCsv,
    updateProductById,
    deleteProduct

} = require('../controllers/product');


productRoutes.get("/products", getProducts);
productRoutes.get("/products/:id", getProductById);
productRoutes.get("/products/category/:categoryName", getProductsByCategoryName);
productRoutes.post("/create-product", upload.single('img'), createProductCard);
productRoutes.get('/products/export/csv', [isAdmin], exportProductsToCsv);
productRoutes.patch('/update-product/:id', upload.single('img'), updateProductById);
productRoutes.delete('/delete-product/:id', deleteProduct);


module.exports = productRoutes;