const db = require('../db')
const user_auth = require('../middleware/user_auth')

const collectionCtrl = {}

//Create a collection, can be null at the beginning
collectionCtrl.createCollection = async (req, res) => {
  user_auth(req, res, async () => {
    const userId = req.user && req.user.id;
    const name = req.body.name;
    const note = req.body.note;
    const recipeIds = req.body.recipeIds || [];

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!name) {
      return res.status(400).json({ message: 'Name is required' });
    }
    
  try {
    const client = await db.connect();
    await client.query('BEGIN');

    // Insert a new row into the collections table
    const insertCollectionQuery = 'INSERT INTO collection (user_id, name, note) VALUES ($1, $2, $3) RETURNING collection_id';
    const insertCollectionValues = [userId, name, note];
    const insertCollectionResult = await client.query(insertCollectionQuery, insertCollectionValues);
    console.log(insertCollectionResult);
    const collectionId = insertCollectionResult[0].collection_id;

    // Insert new rows into the collection_recipe table to associate recipes with the new collection
    for (const recipeId of recipeIds) {
      const insertRecipeQuery = 'INSERT INTO collection_recipe (collection_id, recipe_id) VALUES ($1, $2)';
      const insertRecipeValues = [collectionId, recipeId];
      await client.query(insertRecipeQuery, insertRecipeValues);
    }

    await client.query('COMMIT');

    res.status(201).json({ message: 'Collection created' });
  } catch (error) {
    console.error('Error creating collection:', error);
    res.status(500).json({ message: 'Error creating collection' });
  } 
});
};


//Get all collection
collectionCtrl.getCollection = async (req, res) => {
  try {
    const collection = await db.any(`
      SELECT *
      FROM collection`,
    );
    res.status(200).json(collection);
    console.log(collection);
  } catch (error) {
    console.error('Error retrieving collection:', error);
    res.status(500).json({ message: 'Error retrieving collection' });
  }
};
  

//Get collection by name
collectionCtrl.getCollectionByName = async (req, res) => {
  const name = req.params.name;

  try {
    const collection = await db.any('SELECT * FROM collection WHERE name ILIKE $1', [`%${name}%`]);
    console.log(`Retrieved collection '${name}'`);
    res.json(collection);
  } catch (error) {
    console.error('Error retrieving collection:', error);
    res.status(500).json({ message: 'Error retrieving collection' });
  }
};

//Get collection by id
collectionCtrl.getCollectionById = async (req, res) => {
  const id = req.params.id;

  try {
    const collection = await db.one('SELECT * FROM collection WHERE collection_id = $1', [id]);
    console.log(`Retrieved collection with ID ${id}`);
    res.json(collection);
  } catch (error) {
    console.error('Error retrieving collection:', error);
    res.status(500).json({ message: 'Error retrieving collection' });
  }
};

//Add recipe into collection
collectionCtrl.addRecipe = async (req, res) => {
  const { collection_id, recipe_id } = req.body;

  try {
    await db.none('INSERT INTO collection_recipe (collection_id, recipe_id) VALUES ($1, $2)', [collection_id, recipe_id]);
    console.log(`Recipe ${recipe_id} added to collection ${collection_id}`);
    res.status(200).json({ message: 'Recipe added to collection' });
  } catch (error) {
    console.error('Error adding recipe to collection:', error);
    res.status(500).json({ message: 'Error adding recipe to collection' });
  }
};


//Remove recipe from collection
collectionCtrl.removeRecipe = async (req, res) => {
  const { collection_id, recipe_id } = req.body;

  try {
    const result = await db.result('DELETE FROM collection_recipe WHERE collection_id = $1 AND recipe_id = $2', [collection_id, recipe_id]);
    console.log(`Removed recipe ${recipe_id} from collection ${collection_id}`);
    if (result.rowCount === 0) {
      res.status(404).json({ message: 'Recipe not found in collection' });
    } else {
      res.status(200).json({ message: 'Recipe removed from collection' });
    }
  } catch (error) {
    console.error('Error removing recipe from collection:', error);
    res.status(500).json({ message: 'Error removing recipe from collection' });
  }
};


//Update collection
collectionCtrl.updateCollection = async (req, res) => {
  const id = req.params.id;


  const { name, note } = req.body;

  try {
    const result = await db.result('UPDATE collection SET name = $1, note = $2 WHERE collection_id = $3', [name, note, id]);
    console.log(`Updated collection with ID ${id}`);
    if (result.rowCount === 0) {
      res.status(404).json({ message: 'Collection not found' });
    } else {
      res.status(200).json({ message: 'Collection updated' });
    }
  } catch (error) {
    console.error('Error updating collection:', error);
    res.status(500).json({ message: 'Error updating collection' });
  }
};
  

//Get all recipe available in 1 collection, if needed
collectionCtrl.getRecipesInCollection = async (req, res) => {
  const collection_id = req.params.collection_id;

  try {
    
    const recipes = await db.any('SELECT recipe.* FROM recipe JOIN collection_recipe ON recipe.recipe_id = collection_recipe.recipe_id WHERE collection_recipe.collection_id = $1', [collection_id]);
    console.log(`Retrieved recipes for collection with ID ${collection_id}`);
    
    res.json(recipes);
  } catch (error) {
    console.error('Error retrieving recipes for collection:', error);
    res.status(500).json({ message: 'Error retrieving recipes for collection' });
  }
};
  
//Remove collection
collectionCtrl.removeCollection = async (req, res) => {
  const id = req.params.id;

  try {
    await db.tx(async t => {
      await t.none('DELETE FROM collection_recipe WHERE collection_id = $1', [id]);
      const result = await t.result('DELETE FROM collection WHERE collection_id = $1', [id]);
      console.log(`Removed collection with ID ${id}`);
      if (result.rowCount === 0) {
        throw new Error('Collection not found');
      }
    });
    res.status(200).json({ message: 'Collection removed' });
  } catch (error) {
    console.error('Error removing collection:', error);
    res.status(500).json({ message: 'Error removing collection' });
  }
};

module.exports = collectionCtrl;