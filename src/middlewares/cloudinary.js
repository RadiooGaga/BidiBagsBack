const multer = require('multer')
const cloudinary = require('cloudinary').v2
const { CloudinaryStorage } = require('multer-storage-cloudinary')

//subir la foto
const uploadImage = async (imgUrl) => {
  try {
    const result = await cloudinary.uploader.upload(imgUrl, {
      folder: 'bidi-bags',
      allowedFormats: ['jpg', 'png', 'jpeg', 'gif'],
      overwrite: true,
      invalidate: true  
    });
    return result;
  } catch (error) {
    throw new Error('Error uploading image: ' + error.message);
  }
};


// Almacenar las fotos en Cloudinary
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'bidi-bags',
      allowed_formats: ['jpg', 'png', 'jpeg', 'gif'],
      overwrite: true,
      invalidate: true 
    }
  });

// borrarlas de Cloudinary
const deleteImgCloudinary = (imgUrl) => {
    // Dividir la URL para obtener el public_id
    const imgSplited = imgUrl.split('/');
    const nameSplited = imgSplited[imgSplited.length - 1].split('.');
    const public_id = nameSplited[0];
    const publicId = `bidi-bags/${public_id}`;
 
    // Localizamos publicId e imprimimos callback indicando que se ha podido eliminar.
    cloudinary.uploader.destroy(publicId)
    .then(result => {
        console.log('Imagen eliminada:', result);
      })
      .catch(error => {
        console.error('Error eliminando la imagen:', error);
      });
}

const upload = multer({ storage });
module.exports = { upload, uploadImage, deleteImgCloudinary }