const User = require("../api/models/User");
const { verifyToken } = require("../utils/jsonWebToken");

//sólo el administrador con el rol "admin".
const isAdmin = async (req, res, next) => {
    
    try {
        const token = req.headers.authorization;

        if (!token) {
            return res.status(401).json({ 
                success: false,
                message: "No autorizado: falta el token" ,
                error: "No estás autorizado, no hay token" });
        }

        const parsedToken = token.replace("Bearer ", "");
        const { id } = verifyToken(parsedToken);
        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({
                success: false, 
                message: "Usuario no encontrado", 
                error: "Usuario no encontrado"
            });
        }

        // Verificar el rol del usuario
        if (user.rol === "admin") {
            user.password = null;
            req.user = user;
            next();
        } else if (user.rol === "user") {
            user.password = null;
            req.user = user;
            next();
        } else {
            return res.status(403).json({
                success: false, 
                message: "Acceso denegado: no eres admin",
                error: "Acceso denegado: no eres admin"
            });
        }
        
    } catch (error) {
        return res.status(400).json({
            success: false, 
            message: "Error al procesar la solicitud", 
            error: error.message 
        });
    }
}


const isAuth = async (req, res, next) => {
    try {
        const token = req.headers.authorization;

        if (!token) {
            return res.status(401).json({ error: "No estás autorizado, no hay token" });
        }

        const parsedToken = token.replace("Bearer ", "");
        const { id } = verifyToken(parsedToken);
        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }

        // Adjuntar el usuario autenticado a la solicitud
        user.password = null;
        req.user = user;
        next();
    } catch (error) {
        console.error("Error en la autenticación:", error);
        return res.status(401).json({ error: "No estás autorizado" });
    }
}

module.exports = { isAdmin, isAuth };

