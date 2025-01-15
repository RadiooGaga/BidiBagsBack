const { deleteImgCloudinary } = require('../../middlewares/cloudinary');
const cloudinary = require('cloudinary').v2
const Product = require('../models/Product');
const Category = require('../models/Category');
const Collection = require('../models/Collection');


// TRAER PRODUCTOS
const getProducts = async (req, res, next) => {
    try {
      const products = await Product.find();
      console.log("todos los productos");
      return res.status(200).json(products);
    } catch (error) {
      console.log("no se han encontrado productos");
      return res.status(400).json("error");
    }
};


// TRAER PRODUCTO POR ID
const getProductById = async (req, res, next) => {
    try {
      const { id } = req.params;
      const product = await Product.findById(id)
      console.log("id del producto", id);
      return res.status(200).json(product);
    } catch (error) {
      console.log(error, "no hemos encontrado el producto");
      return res.status(400).json(error);
    }
};


// TRAER PRODUCTOS POR ID DE LA CATEGORÍA
const getProductsByCategoryId = async (req, res, next) => {
  try {
    const { categoryId} = req.params;
    const products = await Product.find({ categoryId });

    if (products.length < 0) {
      return res.status(404).json({ message: "No se encontraron productos para esta categoría" });
    }

    console.log("tus productos por categoría");
    return res.status(200).json(products);

  } catch (error) {
    console.error("Error al obtener productos por categoría:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
}




// TRAER PRODUCTOS POR CATEGORÍA
const getProductsByCategoryName = async (req, res, next) => {
    try {
      const { categoryName } = req.params;
      const cleanedCategory = categoryName.trim(); 
      const products = await Product.find({
        categoryName: new RegExp(`^${cleanedCategory}$`, "i") 
        // Coincidencia exacta e insensible a mayúsculas/minúsculas
    });

      if (products.length < 0) {
        return res.status(404).json({ message: "No se encontraron productos para esta categoría" });
      }

      console.log("tus productos por categoría");
      return res.status(200).json(products);
  
    } catch (error) {
      console.error("Error al obtener productos por categoría:", error);
      return res.status(500).json({ message: "Error interno del servidor" });
    }
}



// TRAER PRODUCTOS POR COLECCIÓN
const getProductsByCollectionName = async (req, res, next) => {
  try {
    const { collectionName } = req.params;
    const cleanedCollection = collectionName.trim(); 
    const products = await Product.find({
      collectionName: new RegExp(`^${cleanedCollection}$`, "i") 
      // Coincidencia exacta e insensible a mayúsculas/minúsculas
  });

    if (products.length < 0) {
      return res.status(404).json({ message: "No se encontraron productos para esta coleccion" });
    }

    console.log("tus productos por coleccion");
    return res.status(200).json(products);

  } catch (error) {
    console.error("Error al obtener productos por colección:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
}



// SUBIR PRODUCTO NUEVO
const createProductCard = async (req, res, next) => {
  try {
    const { categoryId, collectionId, price, description, details, inStock } = req.body;
    const file = req.file;


       // Validar que los campos obligatorios estén presentes
       if (!categoryId || !collectionId || !price || !description || !details) {
        return res.status(400).json({
          success: false,
          message: 'Todos los campos obligatorios deben ser completados.'
        });
      }

      if (!file) {
        return res.status(400).json({ 
          success:false,
          message: 'Por favor, sube una imagen para el producto' });
      }

    //Verificar si inStock es un valor booleano
    const inStockValue = req.body.inStock === 'true' || req.body.inStock === true;

        // Obtener los nombres de la categoría y la colección usando los ObjectId
        const category = await Category.findById(categoryId);
        const collection = await Collection.findById(collectionId);
    
        if (!category || !collection) {
          return res.status(404).json({
            success: false,
            message: 'Categoría o colección no encontrada'
          });
        }
     
  
    // Crear un nuevo producto con los datos y las relaciones correctas
    const newProduct = new Product({
      categoryId, 
      collectionId, 
      categoryName: category.categoryName, 
      collectionName: collection.collectionName,  
      img: file.path, // Guarda la URL de la imagen
      price,
      inStock: inStockValue, // Almacena el valor booleano
      description,
      details,
    });

    // Guardar el nuevo producto en la base de datos
    const productDB = await newProduct.save();
    console.log('Producto creado con éxito!', productDB);
    return res.status(201).json({
      success: true,
      product: productDB,
      message: "PRODUCTO SUBIDO!"
    });

  } catch (error) {
    console.log("Error al crear el producto:", error);
    return res.status(500).json({
      success: false,
      message: 'Hubo un error al crear el producto',
      error: error.message
    });
  }
};




const exportProductsToCsv = async (req, res) => {
    try {
        const products = await Product.find().lean();

        if (!products || products.length === 0) {
          return res.status(404).send("No hay productos para exportar");
        }

      // Convertir los productos a formato CSV
      const headers = Object.keys(products[0]).join(","); // Encabezados
      const rows = products.map(product =>
          Object.values(product).map(value => `"${value}"`).join(",")
      ); // Filas de datos

      const csvContent = [headers, ...rows].join("\n");

      // Enviar el archivo CSV como respuesta
      res.setHeader("Content-Disposition", "attachment; filename=productos.csv");
      res.setHeader("Content-Type", "text/csv");
      res.status(200).send(csvContent);
  } catch (error) {
      console.error("Error al exportar productos a CSV:", error);
      res.status(500).send("Error al exportar productos");
  }
};

// ACTUALIZAR EL PRODUCTO
const updateProductById = async (req, res, next) => {
  try {

    const { id } = req.params;
    const productToUpdate = req.body;
    const file = req.file;

    const oldProduct = await Product.findById(id);
    if (!oldProduct) {
      console.log("Producto no encontrado");
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    // Eliminar imagen antigua si existe
       if (oldProduct.img) {
        deleteImgCloudinary(oldProduct.img);
      }

     // Si hay una nueva imagen, subimos la nueva a Cloudinary
     if (file) {
      const imgUrl = file.path;

      const fileName = file.filename || file.originalname.split('.')[0];
      const publicId = `bidi-bags/${fileName}`;
    
      // Sube la imagen a Cloudinary con un public ID definido
      const result = await cloudinary.uploader.upload(imgUrl, {
        folder: 'bidi-bags', // El folder base
        public_id: fileName, // Elimina sufijos aleatorios
        allowedFormats: ['jpg', 'png', 'jpeg', 'gif'],
        overwrite: true,
        invalidate: true
      });
    
      productToUpdate.img = result.secure_url; // Guarda la URL segura
      productToUpdate.public_id = result.public_id; // Guarda el public ID para borrarlo después
    }

      // Actualizo el producto con la nueva info y la imagen
      const updatedProduct = await Product.findByIdAndUpdate(id, productToUpdate, { new: true }).lean();
      if (!updatedProduct) {
        return res.status(404).json({ success: false, message: "Producto no encontrado" });
      }
  
      console.log('El producto se ha actualizado', updatedProduct);
      return res.status(200).json({ success: true, product: updatedProduct });

    } catch (error) {
      console.error('Error al actualizar el producto', error);
      return res.status(500).json({  success: false, error: 'Error al actualizar el producto' });
    }
};


// BORRAR EL PRODUCTO
const deleteProduct = async (req, res, next) => {
  try {

      const { id } = req.params;
      const product = await Product.findByIdAndDelete(id);

      if (!product) {
          return res.status(404).json({ 
            success: false,
            message: "Producto no encontrado" });
      }
      if (product && product.img) {
        deleteImgCloudinary(product.img);
        console.log("Foto eliminada de Cloudinary", product.img)
      } 

      return res.status(200).json({ 
          success: true,
          message: '¡Producto borrado!',
          deletedEvent: product
      });
  } catch (error) {

      return res.status(400).json({ 
        success: false,
        message: 'Error al eliminar el producto', 
        error: error.message });
  }
};



module.exports = { 
  getProducts, 
  getProductById, 
  getProductsByCategoryId,
  getProductsByCategoryName,
  getProductsByCollectionName, 
  createProductCard, 
  exportProductsToCsv, 
  updateProductById,
  deleteProduct
}
  
  