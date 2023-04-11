const { builtinModules } = require('module')
const db = require('../db')

const collectionCtrl = {}

//Create a collection, can be null at the beginning
collectionCtrl.createCollection = async (req, res) => {
    const userId = req.user.id;
    const name = req.body.name;
    const recipeId = req.body.recipeId || null;
  
    try {
      await db.none('INSERT INTO collection (user_id, name, recipe_id) VALUES ($1, $2, $3)', [userId, name, recipeId]);
      res.status(201).json({ message: 'Collection created' });
    } catch (error) {
      console.error('Error creating collection:', error);
      res.status(500).json({ message: 'Error creating collection' });
    }
  };  

//Get all collection
collectionCtrl.getCollection = async (req, res) => {
    const userId = req.user.id;
    const name = req.params.name;
  
    try {
      const collection = await db.any('SELECT * FROM collection JOIN recipe ON collection.recipe_id = recipe.recipe_id WHERE collection.user_id = $1 AND collection.name = $2', [userId, name]);
      res.status(200).json(collection);
    } catch (error) {
      console.error('Error retrieving collection:', error);
      res.status(500).json({ message: 'Error retrieving collection' });
    }
  };
  

//Get collection by name
collectionCtrl.getCollectionByName = async (req, res) => {
    const userId = req.user.id;
    const name = req.params.name;
  
    try {
      const collection = await db.any('SELECT * FROM collection WHERE user_id = $1 AND name = $2', [userId, name]);
      console.log(`Retrieved collection '${name}' for user with ID '${userId}'`);
      res.json(collection);
    } catch (error) {
      console.error('Error retrieving collection:', error);
      res.status(500).json({ message: 'Error retrieving collection' });
    }
  };  

//Add recipe into collection
collectionCtrl.addRecipe = async (req, res) => {
    const userId = req.user.id;
    const name = req.body.name;
    const recipeId = req.body.recipeId;
  
    try {
      await db.none('INSERT INTO collection (user_id, name, recipe_id) VALUES ($1, $2, $3)', [userId, name, recipeId]);
      res.status(201).json({ message: 'Recipe added to collection' });
    } catch (error) {
      console.error('Error adding recipe to collection:', error);
      res.status(500).json({ message: 'Error adding recipe to collection' });
    }
  };
  

//Remove recipe from collection
collectionCtrl.removeRecipe = async (req, res) => {
    const userId = req.user.id;
    const name = req.params.name;
    const recipeId = req.params.recipeId;
  
    try {
      await db.none('DELETE FROM collection WHERE user_id = $1 AND name = $2 AND recipe_id = $3', [userId, name, recipeId]);
      res.status(200).json({ message: 'Recipe removed from collection' });
    } catch (error) {
      console.error('Error removing recipe from collection:', error);
      res.status(500).json({ message: 'Error removing recipe from collection' });
    }
  };  

//Update note in collection
collectionCtrl.updateNote = async (req, res) => {
    const userId = req.user.id;
    const name = req.params.name;
    const recipeId = req.params.recipeId;
    const note = req.body.note;
  
    try {
      await db.none('UPDATE collection SET note = $1 WHERE user_id = $2 AND name = $3 AND recipe_id = $4', [note, userId, name, recipeId]);
      res.status(200).json({ message: 'Note updated' });
    } catch (error) {
      console.error('Error updating note:', error);
      res.status(500).json({ message: 'Error updating note' });
    }
  };
  
//Get all recipe available in 1 collection, if needed
collectionCtrl.getAllRecipesInCollection = async (req, res) => {
    const userId = req.user.id;
    const name = req.params.name;
  
    try {
      const recipes = await db.any(`
        SELECT recipe.*
        FROM recipe
        INNER JOIN collection
        ON recipe.recipe_id = collection.recipe_id
        WHERE collection.user_id = $1 AND collection.name = $2
      `, [userId, name]);
  
      console.log(`Retrieved all recipes in collection '${name}' for user with ID '${userId}'`);
      res.json(recipes);
    } catch (error) {
      console.error('Error retrieving recipes in collection:', error);
      res.status(500).json({ message: 'Error retrieving recipes in collection' });
    }
  };
  
//Remove collection
collectionCtrl.deleteCollectionByName = async (req, res) => {
    const userId = req.user.id;
    const name = req.params.name;
  
    try {
      const result = await db.result('DELETE FROM collection WHERE user_id = $1 AND name = $2', [userId, name]);
      
      if (result.rowCount === 0) {
        console.log(`Collection '${name}' for user with ID '${userId}' does not exist`);
        res.status(404).json({ message: `Collection '${name}' does not exist` });
        return;
      }
      
      console.log(`Deleted collection '${name}' for user with ID '${userId}'`);
      res.json({ message: `Collection '${name}' deleted successfully` });
    } catch (error) {
      console.error('Error deleting collection:', error);
      res.status(500).json({ message: 'Error deleting collection' });
    }
  };
  

module.exports = collectionCtrl;