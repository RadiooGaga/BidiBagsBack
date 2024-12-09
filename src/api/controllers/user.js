const { createToken } = require("../../utils/jsonWebToken");
const User = require("../models/User");
const bcrypt = require("bcryptjs");


// REGISTRO DE USUARIO
const register = async (req, res, next) => {
  try {
    const newUser = new User({
        userName: req.body.userName,
        userSurname: req.body.userSurname,
        email: req.body.email,
        password: req.body.password,
        favorites: req.body.favorites,
        rol: req.body.rol
    });

    const userExists = await User.findOne({ 
      userName: req.body.userName, 
      userSurname: req.body.userSurname, 
      email: req.body.email 
    });
    
    if (userExists) {
      return res.status(409).json({ 
        success: false,
        message: "El nombre, apellidos e email del usuario ya existen"
      });
    } 

    const user = await newUser.save(); 
    const token = createToken(user._id);

    console.log("Usuario registrado con éxito!", user);
    return res.status(200).json({ 
      success: true,
      message: "Registro exitoso",
      token, 
      user });

  } catch (error) {
    return res.status(400).json("error");
  }
};




// LOGIN DE USUARIO
const login = async (req, res, next) => {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });
  
      if (!user) {
        return res.status(404).json({ error: "Usuario no encontrado" });
      } 
  
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return res.status(400).json({ error: "Usuario o contraseña incorrectos"});
      }
  
      const token = createToken(user._id);
      return res.status(200).json({ 
        success: true,
        message: "Login exitoso",
        token, 
        user });
    } catch (error) {
      return res.status(500).json({ error: "Error interno del servidor" });
    }
  };

   

// TRAER USUARIOS
const getUsers = async (req, res, next) => {
    try {
      const users = await User.find();
      return res.status(200).json(users);
    } catch (error) {
      return res.status(400).json(error);
    }
};


  
// TRAER USUARIO POR ID
const getUserById = async (req, res, next) => {
    try {
      const { id } = req.params;
      const user = await User.findById(id)
      .populate('favorites')
      console.log(user)
      return res.status(200).json(user);
    } catch (error) {
      return res.status(400).json(error);
    }
};
  

  
// ACTUALIZAR USUARIO
const updateUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    console.log(id, "ES EL ID");

    // Buscar el usuario original
    const oldUser = await User.findById(id).populate('favorites');

    // Verificar que el usuario que realiza la solicitud es el mismo que el que quiere modificar
    if (req.user.id.toString() !== id) {
      return res.status(400).json({ message: "No puedes modificar a alguien que no seas tú mismo" });
    }

    // Verificar si el usuario existe
    if (!oldUser) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Crear nuevo user con los datos enviados en el body de la solicitud
    const newUser = { ...req.body };

    // Si la contraseña ha sido modificada, re-hacer el hash
    if (newUser.password) {
      newUser.password = await bcrypt.hash(newUser.password, 10);
    }

    // Si se proporcionan nuevos favoritos, actualizarlos
    if (Array.isArray(newUser.favorites)) {
      // Crear un conjunto (set) de los favoritos antiguos y nuevos para evitar duplicados
      const updatedFavorites = new Set([...oldUser.favorites, ...newUser.favorites]);

      // Convertimos el set de vuelta a un array
      newUser.favorites = [...updatedFavorites];
      console.log('Favoritos actualizados:', newUser.favorites);
    }

    // Actualizar el usuario con los nuevos datos (incluyendo los favoritos modificados)
    const userUpdated = await User.findByIdAndUpdate(id, newUser, { new: true }).populate('favorites');

    if (userUpdated) {
      console.log("Usuario actualizado");
      return res.status(200).json({ user: userUpdated });
    } else {
      return res.status(404).json({ message: 'No se pudo actualizar el usuario' });
    }

  } catch (error) {
    console.error("No ha podido actualizarse el usuario", error);
    return res.status(400).json({ message: "Error al actualizar el usuario" });
  }
};


  
  //BORRAR USUARIO (ADMIN)
  const deleteUserById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { user } = req;
  
        // Verifica si el usuario autenticado está intentando eliminar su propia cuenta
        if (user._id.toString() !== id) {
            return res.status(403).json({ message: "No puedes eliminar una cuenta que no sea la tuya" });
        }
        const userToDelete = await User.findByIdAndDelete(id);
     
        if (!userToDelete) {
            console.log("Usuario no encontrado");
            return res.status(404).json({ message: "Usuario no encontrado" });
        }
  
        return res.status(200).json({
            message: "¡Usuario borrado!",
            userToDelete,
        });
      
    } catch (error) {
        console.error("Error al eliminar el usuario", error);
        return res.status(400).json({ message: "Error al eliminar el usuario", error });
    }
  };

  
  

  
  module.exports = {
      register,
      login,
      getUsers,
      getUserById,
      updateUserById,
      deleteUserById
    };
  
  
  