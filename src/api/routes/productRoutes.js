const { isAdmin } = require("../../middlewares/auth");
const productRoutes = require("express").Router();
const { upload } = require('../../middlewares/cloudinary')


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
productRoutes.post("/create-product", [isAdmin], upload.single('img'), createProductCard);
productRoutes.get('/products/export/csv', [isAdmin], exportProductsToCsv);
productRoutes.patch('/update-product/:id', [isAdmin], upload.single('img'), updateProductById);
productRoutes.delete('/delete-product/:id',[isAdmin], deleteProduct);


module.exports = productRoutes;