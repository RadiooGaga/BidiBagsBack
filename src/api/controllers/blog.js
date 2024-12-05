const Post = require('../models/BlogModel')

const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find({});
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los posts' });
  }
};

const createBlogPost = async (req, res, next) => {
    try {
      const { title, content } = req.body;
      const file = req.file;

      if (!file) {
        return res.status(400).json({ message: 'Por favor, sube una imagen para el post' });
      }

    const newPost = new Post({
      title,
      content,
      img: file.path,  // Guarda la URL de la imagen en cloudinary
    });

      const postDB = await newPost.save();
      console.log('Post creado con éxito y guardado en la DB!!')
      return res.status(201).json({ 
        blog: postDB, 
        message: "POST SUBIDO!" });
      
    } catch (error) {
      console.log("error al crear el post");
      return res.status(400).json(error);
    }
}

module.exports = { getAllPosts, createBlogPost };