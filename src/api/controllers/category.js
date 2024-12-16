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

// TRAER USUARIO POR ID
const getCategoryById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const category = await Category.findById(id)
    .populate('products')
    console.log(category)
    return res.status(200).json(category);
  } catch (error) {
    return res.status(400).json(error);
  }
};


const createCategory = async (req, res, next) => {
    try {
      const { categoryName, visible } = req.body;
      const file = req.file;

      if (!file) {
        return res.status(400).json({ 
          success: false, 
          error: true, 
          message: 'Por favor, sube una imagen para el producto' });
      }

       //Verificar si visible es un valor booleano
      const visibleState = req.body.visible === 'true' || req.body.visible === true;

    const existingCategory = await Category.findOne({ categoryName });
    if (existingCategory) {
      console.log("La categoría ya existe");
      return res.status(409).json({ 
        success: false, 
        error: true, 
        message: "La categoría ya existe" }); 
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
        success: true
      });
      
    } catch (error) {
      console.log("error al crear la categoría");
      return res.status(400).json({ success: false, error: true });
    }
}

const exportCategoriesToCsv = async (req, res) => {
  try {
      const categories = await Category.find().lean();

      if (!categories || categories.length === 0) {
        return res.status(404).send("No hay categorias para exportar");
      }

    // Convertir los categorias a formato CSV
    const headers = Object.keys(categories[0]).join(","); // Encabezados
    const rows = categories.map(category =>
        Object.values(category).map(value => `"${value}"`).join(",")
    ); // Filas de datos

    const csvContent = [headers, ...rows].join("\n");

    // Enviar el archivo CSV como respuesta
    res.setHeader("Content-Disposition", "attachment; filename=categorias.csv");
    res.setHeader("Content-Type", "text/csv");
    res.status(200).send(csvContent);
} catch (error) {
    console.error("Error al exportar categorias a CSV:", error);
    res.status(500).send("Error al exportar categorias");
}
};
  
  module.exports = { getCategories, getCategoryById, createCategory, exportCategoriesToCsv };