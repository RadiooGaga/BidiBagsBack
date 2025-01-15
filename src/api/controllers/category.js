const { deleteImgCloudinary } = require('../../middlewares/cloudinary');
const cloudinary = require('cloudinary').v2
const Category = require("../models/Category");


// TRAER CATEGORÍAS
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

// TRAER CATEGORÍA POR ID
const getCategoryById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const category = await Category.findById(id);
    console.log(category)
    return res.status(200).json(category);
  } catch (error) {
    return res.status(400).json(error);
  }
};


//CREAR CATEGORÍA
const createCategory = async (req, res, next) => {
    try {
      const { categoryName, visible } = req.body;
      const file = req.file;

      if (!file) {
        return res.status(400).json({ 
          success: false, 
          error: true, 
          message: 'Por favor, sube una imagen para la categoría' });
      }

       //Verificar si visible es un valor booleano
      const visibleState = req.body.visible === 'true' || req.body.visible === true;
      const lowerCategoryName = categoryName.toLowerCase();

    const existingCategory = await Category.findOne({ categoryName: lowerCategoryName });
    if (existingCategory) {
      console.log("La categoría ya existe");
      return res.status(409).json({ 
        success: false, 
        error: true, 
        message: "La categoría ya existe" }); 
    }

    const newCategory = new Category({
      categoryName: lowerCategoryName,
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


//EXPORTAR CATEGORÍAS A CSV
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



// ACTUALIZAR CATEGORÍA
const updateCategoryById = async (req, res, next) => {
  try {

    const { id } = req.params;
    const categoryToUpdate = req.body;
    const file = req.file;

    const oldCategory = await Category.findById(id);
    if (!oldCategory) {
      console.log("categoría no encontrada");
      return res.status(404).json({ message: "categoría no encontrada" });
    }

    // Eliminar imagen antigua si existe
       if (oldCategory.img) {
        deleteImgCloudinary(oldCategory.img);
      }

     // Si hay una nueva imagen, subimos la nueva a Cloudinary
     if (file) {
      const imgUrl = file.path;

      const fileName = file.filename || file.originalname.split('.')[0];
      const publicId = `bidi-bags/${fileName}`;
    
      // Sube la imagen a Cloudinary con un public ID definido
      const result = await cloudinary.uploader.upload(imgUrl, {
        folder: 'bidi-bags', 
        public_id: fileName, 
        allowedFormats: ['jpg', 'png', 'jpeg', 'gif', 'webp'],
        overwrite: true,
        invalidate: true
      });
    
      categoryToUpdate.img = result.secure_url; 
      categoryToUpdate.public_id = result.public_id; 
    }

      // Actualizo el categoría con la nueva info y la imagen
      const updatedCategory = await Category.findByIdAndUpdate(id, categoryToUpdate, { new: true }).lean();
      if (!updatedCategory) {
        return res.status(404).json({ message: "Categoría no encontrada" });
      }
  
      console.log('La categoría se ha actualizado', updatedCategory);
      return res.status(200).json({ success: true, category: updatedCategory });

    } catch (error) {
      console.error('Error al actualizar la categoría', error);
      return res.status(500).json({ error: 'Error al actualizar la categoría' });
    }
};


// BORRAR LA CATEGORÍA
const deleteCategory = async (req, res, next) => {
  try {

      const { id } = req.params;
      const category = await Category.findByIdAndDelete(id);

      if (!category) {
          return res.status(404).json({ 
            success:false,
            message: "categoría no encontrada" });
      }
      if (category && category.img) {
        deleteImgCloudinary(category.img);
        console.log("Foto eliminada de Cloudinary", category.img)
      } 

      return res.status(200).json({ 
        success: true,
          message: '¡Categoría borrada!',
          deletedCategory: category
      });
  } catch (error) {
      return res.status(400).json({
        success: false, 
        message: 'Error al eliminar la categoría', 
        error: error.message });
  }
};
  
  module.exports = { getCategories, getCategoryById, createCategory, exportCategoriesToCsv, updateCategoryById, deleteCategory };