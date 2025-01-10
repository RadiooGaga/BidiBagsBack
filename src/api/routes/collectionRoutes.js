const { isAdmin } = require('../../middlewares/auth');
const collectionRoutes = require("express").Router();
const { upload } = require("../../middlewares/cloudinary");


const { 
    getCollections,
    getCollectionById,
    createCollection,
    exportCollectionsToCsv,
    updateCollectionById,
    deleteCollection
} = require("../controllers/collection");



collectionRoutes.get("/collections", getCollections);
collectionRoutes.get('/collection/:id', getCollectionById);
collectionRoutes.post("/create-collection",  [isAdmin], upload.single('img'), createCollection);
collectionRoutes.get('/collections/export/csv', [isAdmin], exportCollectionsToCsv);
collectionRoutes.patch('/update-collection/:id', [isAdmin], upload.single('img'), updateCollectionById);
collectionRoutes.delete('/delete-collection/:id',[isAdmin], deleteCollection);

module.exports =  collectionRoutes;