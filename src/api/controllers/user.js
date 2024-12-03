const { createToken } = require("../../utils/jsonWebToken");
const User = require("../models/User");
const Post = require('../models/BlogModel');
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





// SUBIR POST NUEVO
const createBlogPost = async (req, res, next) => {
    try {
      const { title, content, img } = req.body;
      const file = req.file;

      if (!file) {
        return res.status(400).json({ message: 'Por favor, sube una imagen para el post' });
      }
       
      // Crear un nuevo post en el blog
      const newPost = new Post({
        title,
        content,
        img: file.path,  // Guarda la URL de la imagen en cloudinary
      });
  
      const postBlogDB = await newPost.save(); // Guardado del post en la base de datos
      console.log('Post creado con éxito!');
      return res.status(201).json({ 
        post: postBlogDB, 
        message: "ENTRADA SUBIDA!" });
  
    } catch (error) {
      console.log("Error al crear el post:", error);
      return res.status(500).json({ 
        message: 'Hubo un error al crear el post', 
        error: error.message });
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
      console.log(id, "ES EL ID")
      // Buscar el usuario original
      const oldUser = await User.findById(id);
      
      if (req.user.id.toString() !== id) {
        return res.status(400).json("No puedes modificar a alguien que no seas tú mismo");
      }

      if (!oldUser) {
          return res.status(404).json("Usuario no encontrado");
      }

      // crear nuevo user
      const newUser = { ...req.body };
      // Si la contraseña ha sido modificada, re-hacer el hash
      if (newUser.password) {
        newUser.password = await bcrypt.hash(newUser.password, 10);
      }

         //buscar si había favoritos en el oldUser
         const myFavoritesIndex = oldUser.favorites.indexOf(newUser.favorites[0]);
         console.log('favoritos del old user', myFavoritesIndex);
         
         //para mis favoritos
         if (myFavoritesIndex === -1) { // si el favorito no está en mis favoritos
           newUser.favorites = [...oldUser.favorites, ...newUser.favorites];
           console.log('favorito no encontrado, añadiendo\n', newUser)
         } else {
           oldUser.favorites.splice(myFavoritesIndex, 1);//si está el mismo, se quita.
           newUser.favorites = oldUser.favorites;
           console.log('favorito no encontrado, borrando\n', newUser)
         }

      // Actualizar el usuario
      const userUpdated = await User.findByIdAndUpdate(id, newUser, { new: true});
      if (userUpdated) {
        console.log("usuario actualizado");
        return res.status(200).json({ user: userUpdated });
      } else {
        return res.status(404).json('No se pudo actualizar el usuario');
      }

  } catch (error) {
      console.log("no ha podido actualizarse el usuario", error);
      return res.status(400).json("error");
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
      createBlogPost,
      getUsers,
      getUserById,
      updateUserById,
      deleteUserById
    };
  
  
  


 /*
   // ACTUALIZAR USUARIO
const updateUserById = async (req, res, next) => {
  try {
      const { id } = req.params;
      
      if (req.user._id.toString() !== id) {
        return res.status(400).json("No puedes modificar a alguien que no seas tu mismo")
      }
      const oldUser = await User.findById(id) //buscar el user
      const newUser = new User(req.body); // almacenar como newUser
      //crear nuevo id del usuario nuevo, que es el mismo pero para el nuevo user.
      newUser._id = id; 
      
      //buscar si había favoritos en el oldUser
      const myFavoritesIndex = oldUser.myEvents.indexOf(newUser.myEvents[0]);
      console.log('favoritos del old user', myFavoritesIndex);
      
      //para mis favoritos
      if (myFavoritesIndex === -1) { // si el favorito no está en mis favoritos
        newUser.favorites = [...oldUser.favorites, ...newUser.favorites];
        console.log('favorito no encontrado, añadiendo\n', newUser)
      } else {
        oldUser.favorites.splice(myFavoritesIndex, 1);//si está el mismo, se quita.
        newUser.favorites = oldUser.favorites;
        console.log('favorito no encontrado, borrando\n', newUser)
      }

      const userUpdated = await User.findByIdAndUpdate(id, newUser, {
        new: true,
      });

      console.log("usuario actualizado");
      return res.status(200).json(userUpdated);
  
    } catch (error) {
      console.log("no ha podido actualizarse el usuario");
      return res.status(400).json("error");
    }
}
 */