const express = require('express');
const router = express.Router();
const collectionCtrl = require('../controllers/collectionCtrl');
// const { isAuthenticated } = require();

// Create a new collection
router.post('/collections', isAuthenticated, collectionCtrl.createCollection);

// Get all collections
router.get('/collections', isAuthenticated, collectionCtrl.getAllCollections);

// Get a collection by name
router.get('/collections/:name', isAuthenticated, collectionCtrl.getCollectionByName);

// Delete a collection by name
router.delete('/collections/:name', isAuthenticated, collectionCtrl.deleteCollectionByName);

// Add a recipe to a collection
router.post('/collections/:name/recipe', isAuthenticated, collectionCtrl.addRecipeToCollection);

// Remove recipe
router.delete('/collections/:name/recipe/:id', isAuthenticated, collectionCtrl.removeRecipeFromCollection);

// Get all recipes in a collection
router.get('/collections/:name/recipes', isAuthenticated, collectionCtrl.getAllRecipesInCollection);

module.exports = router;
