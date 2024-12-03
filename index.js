const writeAndReadFile = require('./src/files/file');
require("dotenv").config();
const express = require('express');
const bodyParser = require('body-parser')
const cloudinary = require('cloudinary').v2;
const { connectDB } = require("./src/config/db");
const cors = require('cors');

const userRoutes = require('./src/api/routes/userRoutes');
const productRoutes = require('./src/api/routes/productRoutes')
const categoryRoutes = require('./src/api/routes/categoryRoutes');


const app = express();

app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));


cloudinary.config = {
    CLOUDINARY_CLOUD_NAME: process.env.CLOUD_NAME,
    CLOUDINARY_API_KEY: process.env.API_KEY,
    CLOUDINARY_API_SECRET: process.env.API_SECRET,
    CLOUDINARY_URL:process.env.CLOUDINARY_URL
  };

if (process.env.NODE_ENV !== 'production') {
    writeAndReadFile();
}

connectDB();

app.use(express.json()); 
app.use(cors());
/*
app.use(cors({
    origin: 'http://localhost:5173'
  }));*/

app.use('/bidi-bags', userRoutes);
app.use('/bidi-bags', productRoutes)
app.use('/bidi-bags', categoryRoutes);



app.use('/', (req, res, next) => {
    return res.status(404).json('Ruta no encontrada');
})


const PORT = 3005;  
app.listen(PORT, () => {
    console.log(`http://localhost:${PORT}`, "aplicación corriendo");
});


