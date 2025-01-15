const { deleteImgCloudinary } = require('../../middlewares/cloudinary');
const cloudinary = require('cloudinary').v2
const Collection = require("../models/Collection");


// TRAER COLECCIONES
const getCollections = async (req, res, next) => {
  try {
    const collections = await Collection.find();
    console.log(collections,"todas las colecciones");
    return res.status(200).json(collections);
  } catch (error) {
    console.log("no se han encontrado colecciones");
    return res.status(400).json("error");
  }
};


// TRAER COLECCIÓN POR ID
const getCollectionById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const collection = await Collection.findById(id)
    console.log(collection)
    return res.status(200).json(collection);
  } catch (error) {
    return res.status(400).json(error);
  }
};


//CREAR COLECCIÓN
const createCollection= async (req, res, next) => {
  try {
    const { collectionName, visible } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ 
        success: false, 
        error: true, 
        message: 'Por favor, sube una imagen para la colección' });
    }

     //Verificar si visible es un valor booleano
    const visibleState = req.body.visible === 'true' || req.body.visible === true;
    const lowerCollectionName = collectionName.toLowerCase();

  const existingCollection = await Collection.findOne({ collectionName: lowerCollectionName });
  if (existingCollection) {
    console.log("La colección ya existe");
    return res.status(409).json({ 
      success: false, 
      error: true, 
      message: "La colección ya existe" }); 
  }

  const newCollection = new Collection({
    collectionName: lowerCollectionName,
    img: file.path,  // Guarda la URL de la imagen en cloudinary
    visible: visibleState
  });

    const ccollectionDB = await newCollection.save();
    console.log('Colección creada con éxito y guardada en la DB!!')
    return res.status(201).json({ 
      collectionName: ccollectionDB, 
      success: true
    });
    
  } catch (error) {
    console.log("error al crear la colección");
    return res.status(400).json({ success: false, error: true });
  }
}


//EXPORTAR COLECCIONES A CSV
const exportCollectionsToCsv = async (req, res) => {
  try {
      const collections = await Collection.find().lean();

      if (!collections || collections.length === 0) {
        return res.status(404).send("No hay colecciones para exportar");
      }

    // Convertir las colecciones a formato CSV
    const headers = Object.keys(collections[0]).join(","); // Encabezados
    const rows = collections.map(collection =>
        Object.values(collection).map(value => `"${value}"`).join(",")
    ); // Filas de datos

    const csvContent = [headers, ...rows].join("\n");

    // Enviar el archivo CSV como respuesta
    res.setHeader("Content-Disposition", "attachment; filename=colecciones.csv");
    res.setHeader("Content-Type", "text/csv");
    res.status(200).send(csvContent);
  } catch (error) {
      console.error("Error al exportar colecciones a CSV:", error);
      res.status(500).send("Error al exportar colecciones");
  }
};



// ACTUALIZAR COLECCIÓN
const updateCollectionById = async (req, res, next) => {
  try {

    const { id } = req.params;
    const collectionToUpdate = req.body;
    const file = req.file;

    const oldCollection = await Collection.findById(id);
    if (!oldCollection) {
      console.log("colección no encontrada");
      return res.status(404).json({ message: "colección no encontrada" });
    }

    // Eliminar imagen antigua si existe
       if (oldCollection.img) {
        deleteImgCloudinary(oldCollection.img);
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
        allowedFormats: ['jpg', 'png', 'jpeg', 'gif'],
        overwrite: true,
        invalidate: true
      });
    
      collectionToUpdate.img = result.secure_url; 
      collectionToUpdate.public_id = result.public_id; 
    }

      // Actualizo el colección con la nueva info y la imagen
      const updatedCollection = await Collection.findByIdAndUpdate(id, collectionToUpdate, { new: true }).lean();
      if (!updatedCollection) {
        return res.status(404).json({ message: "Colección no encontrada" });
      }
  
      console.log('La colección se ha actualizado', updatedCollection);
      return res.status(200).json({ success: true, collection: updatedCollection });

    } catch (error) {
      console.error('Error al actualizar la colección', error);
      return res.status(500).json({ error: 'Error al actualizar la colección' });
    }
};


// BORRAR LA CATEGORÍA
const deleteCollection = async (req, res, next) => {
  try {

      const { id } = req.params;
      const collection = await Collection.findByIdAndDelete(id);

      if (!collection) {
          return res.status(404).json({ 
            success:false,
            message: "colección no encontrada" });
      }
      if (collection && collection.img) {
        deleteImgCloudinary(collection.img);
        console.log("Foto eliminada de Cloudinary", collection.img)
      } 

      return res.status(200).json({ 
        success: true,
          message: '¡Colección borrada!',
          deletedCollection: collection
      });
  } catch (error) {
      return res.status(400).json({
        success: false, 
        message: 'Error al eliminar la colección', 
        error: error.message });
  }
};
  
  module.exports = { 
    getCollections, 
    getCollectionById, 
    createCollection, 
    exportCollectionsToCsv , 
    updateCollectionById, 
    deleteCollection };