const express = require('express')
const collectionCtrl = require('../controllers/collectionCtrl')
const collectionRouter = express.Router()
const user_auth = require('../middleware/user_auth')
const {
  getAuthUrl,
  getAccessToken,
  getNewAccessToken,
  googleCallBack
} = require('../controllers/google_auth')
const { upload, storage } = require('../services/multerHandleImg')

// Create a new collection
collectionRouter.post('/', collectionCtrl.createCollection)

// Get all collections
collectionRouter.get('/', user_auth, collectionCtrl.getCollection)

// Get a collection by name
collectionRouter.get(
  '/name/:name',
  user_auth,
  collectionCtrl.getCollectionByName
)

//Get collection by id
collectionRouter.get('/:id', user_auth, collectionCtrl.getCollectionById)

// Remove recipe
collectionRouter.delete(
  '/remove-recipe',
  user_auth,
  collectionCtrl.removeRecipe
)

// Delete a collection by id
collectionRouter.delete('/:id', user_auth, collectionCtrl.removeCollection)

// Add a recipe to a collection
collectionRouter.post('/add-recipe', user_auth, collectionCtrl.addRecipe)

// Get all recipes in a collection
collectionRouter.get(
  '/:collection_id/recipes',
  user_auth,
  collectionCtrl.getRecipesInCollection
)

//Update collection
collectionRouter.put('/:id', user_auth, collectionCtrl.updateCollection)

collectionRouter.post(
  '/update-img/:collectionId',
  upload.single('collectionImage'), user_auth,
  collectionCtrl.saveCollectionImg
)

collectionRouter.get('/get-img/:collectionId', user_auth,collectionCtrl.getCollectionImg)

module.exports = collectionRouter
