const { deleteImgCloudinary } = require('../../middlewares/cloudinary');
const cloudinary = require('cloudinary').v2
const Product = require('../models/Product');

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
      const product = await Product.findById(id);
      console.log("id del producto", id);
      return res.status(200).json(product);
    } catch (error) {
      console.log(error, "no hemos encontrado el producto");
      return res.status(400).json(error);
    }
};


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



// SUBIR PRODUCTO NUEVO
const createProductCard = async (req, res, next) => {
  try {
    const { categoryName, collectionName, price, inStock, description, details } = req.body;
    const file = req.file;
   
   //Verificar si inStock es un valor booleano
  const inStockValue = req.body.inStock === 'true' || req.body.inStock === true;

    if (!file) {
      return res.status(400).json({ message: 'Por favor, sube una imagen para el producto' });
    }
     
    // Crear un nuevo producto
    const newProduct = new Product({
      categoryName,
      collectionName,
      img: file.path,  // Guarda la URL de la imagen en cloudinary
      price,
      inStock: inStockValue,  // Almacena el valor booleano
      description,
      details,
    });

    const productDB = await newProduct.save(); // Guardado del producto en la base de datos
    console.log('Producto creado con éxito!');
    return res.status(201).json({ 
      product: productDB, 
      message: "PRODUCTO SUBIDO!" });

  } catch (error) {
    console.log("Error al crear el producto:", error);
    return res.status(500).json({ 
      message: 'Hubo un error al crear el producto', 
      error: error.message });
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
        return res.status(404).json({ message: "Prooducto no encontrado" });
      }
  
      console.log('El producto se ha actualizado', updatedProduct);
      return res.status(200).json({ success: true, product: updatedProduct });

    } catch (error) {
      console.error('Error al actualizar el producto', error);
      return res.status(500).json({ error: 'Error al actualizar el producto' });
    }
};


// BORRAR EL PRODUCTO
const deleteProduct = async (req, res, next) => {
  try {

      const { id } = req.params;
      const product = await Product.findByIdAndDelete(id);

      if (!product) {
          return res.status(404).json({ message: "Producto no encontrado" });
      }
      if (product && product.img) {
        deleteImgCloudinary(product.img);
        console.log("Foto eliminada de Cloudinary", product.img)
      } 

      return res.status(200).json({ 
          message: '¡Producto borrado! Foto eliminada  de Cloudinary',
          deletedEvent: product
      });
  } catch (error) {

      return res.status(400).json({ message: 'Error al eliminar el producto', error: error.message });
  }
};



module.exports = { 
  getProducts, 
  getProductById, 
  getProductsByCategoryName, 
  createProductCard, 
  exportProductsToCsv, 
  updateProductById,
  deleteProduct
}
  
  