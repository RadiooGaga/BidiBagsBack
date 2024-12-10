
const { isAdmin, isAuth } = require("../../middlewares/auth");
const userRoutes = require("express").Router();

// ------------------ ACORDARSE DE ISAUTH [isAuth] para alguas funcionalidades ----------


//CONTROLADORES DE USUARIOS
const {
    register,
    login,
    getUsers,
    getUserById,
    updateUserById,
    deleteUserById
} = require("../controllers/user");


userRoutes.post("/register", register);
userRoutes.post("/login", login);
userRoutes.get("/users", [isAdmin], getUsers);
userRoutes.get("/user/:id", getUserById);
userRoutes.put("/update-user/:id", [isAuth], updateUserById);
userRoutes.delete("/delete-user/:id", [isAdmin], deleteUserById);


module.exports = userRoutes;