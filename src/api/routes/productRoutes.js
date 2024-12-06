const { isAdmin } = require("../../middlewares/auth");
const productRoutes = require("express").Router();
const { upload } = require('../../middlewares/cloudinary')

// ------------------ ACORDARSE DE ISAUTH [isAuth] para alguas funcionalidades ----------

//CONTROLADORES DE PRODUCTOS

const { 
    getProducts, 
    getProductById, 
    getProductsByCategoryName, 
    createProductCard 

} = require('../controllers/products');


productRoutes.get("/products", getProducts);
productRoutes.get("/products/:id", getProductById);
productRoutes.get("/products/category/:categoryName", getProductsByCategoryName);
productRoutes.post("/create-product", upload.single('img'), createProductCard);


module.exports = productRoutes;