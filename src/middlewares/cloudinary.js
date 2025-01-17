const multer = require('multer')
const cloudinary = require('cloudinary').v2
const { CloudinaryStorage } = require('multer-storage-cloudinary')

//subir la foto
/*
const uploadImage = async (imgUrl) => {
  try {
    const result = await cloudinary.uploader.upload(imgUrl, {
      folder: 'bidi-bags',
      allowedFormats: ['jpg', 'png', 'jpeg', 'gif'],
      overwrite: true,
      invalidate: true  
    });
    return result.url;
  } catch (error) {
    throw new Error('Error uploading image: ' + error.message);
  }
};*/

/*
// Almacenar las fotos en Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    let folderName = 'bidi-bags'; // Carpeta por defecto

    // Lógica para determinar la carpeta
    if (req.path.includes('bidi-bags')) {
      folderName = 'bidi-bags';
    } else if (req.path.includes('blog')) {
      folderName = 'blog-posts';
    } else if (req.path.includes('profile-pictures')) {
      folderName = 'profile-pictures';
    }

    return {
      folder: folderName,
      allowed_formats: ['jpg', 'png', 'jpeg', 'gif'],
      overwrite: true,
      invalidate: true,
    };
  },
});*/

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'bidi-bags',
      allowed_formats: ['jpg', 'png', 'jpeg', 'gif', 'webp'],
      overwrite: true,
      invalidate: true 
    }
  });


// ELIMINAR IMÁGENES
const deleteImgCloudinary = async (imgUrl) => {
  if (!imgUrl) {
    console.log('No se proporcionó una URL de imagen.');
    return;
  }

  // Extrae el public_id desde la URL
  const imgSplited = imgUrl.split('/');
  const fileName = imgSplited[imgSplited.length - 1].split('.')[0];
  const publicId = `bidi-bags/${fileName}`;

  console.log("Public ID a eliminar:", publicId);

  try {
    const result = await cloudinary.uploader.destroy(publicId);
    console.log('Imagen eliminada:', result);
  } catch (error) {
    console.error('Error eliminando la imagen:', error);
  }
};


const upload = multer({ storage });
module.exports = { upload, /*uploadImage,*/ deleteImgCloudinary }