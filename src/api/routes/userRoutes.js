
const { isAdmin, isAuth } = require("../../middlewares/auth");
const { upload } = require('../../middlewares/cloudinary')
const userRoutes = require("express").Router();

// ------------------ ACORDARSE DE ISAUTH [isAuth] para alguas funcionalidades ----------


//CONTROLADORES DE USUARIOS
const {
    register,
    login,
    createBlogPost,
    getUsers,
    getUserById,
    updateUserById,
    deleteUserById
} = require("../controllers/user");


userRoutes.post("/register", register);
userRoutes.post("/login", login);
userRoutes.post("/create-post", upload.single('img'), createBlogPost);
userRoutes.get("/users", [isAdmin], getUsers);
userRoutes.get("/user/:id",[isAdmin], getUserById);
userRoutes.put("/update-user/:id", [isAuth], updateUserById);
userRoutes.delete("/delete-user/:id", [isAdmin], deleteUserById);

module.exports = userRoutes;