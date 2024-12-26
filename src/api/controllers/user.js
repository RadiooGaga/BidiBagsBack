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
        rol: "user",   
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
    console.error('Error en el registro:', error); 
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
const updateUserById = async (req, res) => {
  try {
    const { id } = req.params; // ID del user
    const updates = req.body; // Nuevos datos enviados en el body
    const { newPaymentMethod, shippingAddress, billingAddress } = updates; // Extraer campos específicos

    // Verificar que el usuario que realiza la solicitud es el mismo
    if (req.user.id.toString() !== id) {
      return res.status(403).json({ message: "No puedes modificar a otro usuario" });
    }

    // Buscar el usuario original
    const oldUser = await User.findById(id);

    if (!oldUser) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Si la contraseña ha sido modificada, re-hacer el hash
    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }

    //console.log("Body recibido en la solicitud:", updates);

    
    if (updates.favoritesToAdd || updates.favoritesToRemove) {
      const favoritesToAdd = updates.favoritesToAdd || [];
      const favoritesToRemove = updates.favoritesToRemove || [];

      const updatedFavorites = oldUser.favorites
        .filter((id) => !favoritesToRemove.includes(id.toString())) // Eliminar favoritos
        .concat(favoritesToAdd.filter((id) => !oldUser.favorites.includes(id))); // Añadir nuevos sin duplicados

        // Filtrar duplicados, en caso de que alguna lógica añada favoritos repetidos
        const uniqueFavorites = [...new Set(updatedFavorites)];

        updates.favorites = uniqueFavorites; //lista filtrada y sin duplicados
      console.log('Favoritos actualizados:', uniqueFavorites);

    }

    // Construir las operaciones de actualización
    const updateOperations = { $set: updates };

    // Agregar un nuevo método de pago si está presente
    if (newPaymentMethod) {
      updateOperations.$push = { paymentMethods: newPaymentMethod };
    }

    // Actualizar direcciones si están presentes en los datos enviados
    if (shippingAddress) {
      updateOperations.$set.shippingAddress = shippingAddress;
    }

    if (billingAddress) {
      updateOperations.$set.billingAddress = billingAddress;
    }

    // Actualizar el usuario en la base de datos
    const userUpdated = await User.findByIdAndUpdate(
      id,
      updateOperations,
      { new: true, runValidators: true } // Opciones para devolver el usuario actualizado y validar datos
    ).populate('favorites');

    if (!userUpdated) {
      return res.status(404).json({ message: "No se pudo actualizar el usuario" });
    }

    console.log('Usuario actualizado:', userUpdated);
    return res.status(200).json({ user: userUpdated });

  } catch (error) {
    console.error("Error al actualizar el usuario:", error);
    return res.status(500).json({ message: "Error al actualizar el usuario" });
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
  
  
  