const jwt = require("jsonwebtoken");
require('dotenv').config(); 

//const user = { id: 123, username: 'usuario' }; // Información del usuario

const createToken = (id) => {
    const payload = { id }; // Agregar más datos al payload según necesidad
    const token = jwt.sign(payload, process.env.SECRET_KEY, { expiresIn: '1y' });
    return token;
};

const verifyToken = (token) => {
    try {
        return jwt.verify(token, process.env.SECRET_KEY);
    } catch (err) {
        console.log('Token inválido:', err.message);
        return null;
    }
}


// Uso de la función pasando x ejemplo un ID de usuario
const token = createToken(123); 
console.log('Token generado:', token);

module.exports = { createToken, verifyToken }


