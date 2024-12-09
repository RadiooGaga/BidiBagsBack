const Category = require("../models/Category");

// TRAER PRODUCTOS
const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find();
    console.log("todas las categorías");
    return res.status(200).json(categories);
  } catch (error) {
    console.log("no se han encontrado categorías");
    return res.status(400).json("error");
  }
};


const createCategory = async (req, res, next) => {
    try {
      const { categoryName, visible } = req.body;
      const file = req.file;

      if (!file) {
        return res.status(400).json({ message: 'Por favor, sube una imagen para el producto' });
      }

       //Verificar si visible es un valor booleano
      const visibleState = req.body.visible === 'true' || req.body.visible === true;

    const existingCategory = await Category.findOne({ categoryName });
    if (existingCategory) {
      console.log("La categoría ya existe");
      return res.status(409).json({ message: "La categoría ya existe" }); 
    }

    const newCategory = new Category({
      categoryName,
      img: file.path,  // Guarda la URL de la imagen en cloudinary
      visible: visibleState
    });

      const categoryDB = await newCategory.save();
      console.log('Categoría creada con éxito y guardada en la DB!!')
      return res.status(201).json({ 
        categoryName: categoryDB, 
        message: "CATEGORÍA SUBIDA!" });
      
    } catch (error) {
      console.log("error al crear la categoría");
      return res.status(400).json(error);
    }
}
  
  module.exports = { getCategories, createCategory };