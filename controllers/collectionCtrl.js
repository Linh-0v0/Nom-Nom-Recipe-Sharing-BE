const db = require('../db')
const user_auth = require('../middleware/user_auth')
const {
  uploadBytes,
  ref,
  getDownloadURL,
  deleteObject
} = require('firebase/storage')
const { v4: uuidv4 } = require('uuid')
const { storage } = require('../firebaseConfig')
const collectionCtrl = {}

//Create a collection, can be null at the beginning
collectionCtrl.createCollection = async (req, res) => {
  user_auth(req, res, async () => {
    const userId = req.user && req.user.id
    const name = req.body.name
    const note = req.body.note
    const recipeIds = req.body.recipeIds || []
    const startingCollectionId = 7

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    if (!name) {
      return res.status(400).json({ message: 'Name is required' })
    }

    try {
      const client = await db.connect()
      await client.query('BEGIN')

      const getNextCollectionIdQuery = `SELECT nextval('collection_collection_id_seq') AS next_collection_id`
      const { next_collection_id } = await client
        .query(getNextCollectionIdQuery)
        .then(result => result[0])
      const collection_id = Math.max(next_collection_id, startingCollectionId)

      // Insert a new row into the collections table
      const insertCollectionQuery =
        'INSERT INTO collection (collection_id, user_id, name, note) VALUES ($1, $2, $3, $4) RETURNING collection_id'
      const insertCollectionValues = [collection_id, userId, name, note]
      const insertCollectionResult = await client.query(
        insertCollectionQuery,
        insertCollectionValues
      )
      console.log(insertCollectionResult)
      const collectionId = insertCollectionResult[0].collection_id

      // Insert new rows into the collection_recipe table to associate recipes with the new collection
      for (const recipeId of recipeIds) {
        const insertRecipeQuery =
          'INSERT INTO collection_recipe (collection_id, recipe_id) VALUES ($1, $2)'
        const insertRecipeValues = [collectionId, recipeId]
        await client.query(insertRecipeQuery, insertRecipeValues)
      }

      await client.query('COMMIT')
      res.status(201).json({ collectionId, message: 'Collection created' })
    } catch (error) {
      console.error('Error creating collection:', error)
      res.status(500).json({ message: 'Error creating collection' })
    }
  })
}

//Get all collection
collectionCtrl.getCollection = async (req, res) => {
  const userId = req.user && req.user.id

  try {
    const collections = await db.any(
      `
      SELECT *
      FROM collection
      WHERE user_id = $1
    `,
      [userId]
    )

    res.status(200).json(collections)
  } catch (error) {
    console.error('Error retrieving collections:', error)
    res.status(500).json({ message: 'Error retrieving collections' })
  }
}

//Get collection by name
collectionCtrl.getCollectionByName = async (req, res) => {
  const name = req.params.name
  const userId = req.user && req.user.id

  try {
    const collection = await db.any(
      'SELECT * FROM collection WHERE name ILIKE $1 AND user_id = $2',
      [`%${name}%`, userId]
    )
    console.log(`Retrieved collection '${name}' for user with ID '${userId}'`)
    res.json(collection)
  } catch (error) {
    console.error('Error retrieving collection:', error)
    res.status(500).json({ message: 'Error retrieving collection' })
  }
}

//Get collection by id
collectionCtrl.getCollectionById = async (req, res) => {
  const id = req.params.id
  const userId = req.user && req.user.id

  try {
    const collection = await db.one(
      'SELECT * FROM collection WHERE collection_id = $1 AND user_id = $2',
      [id, userId]
    )
    console.log(`Retrieved collection with ID ${id}`)
    res.json(collection)
  } catch (error) {
    console.error('Error retrieving collection:', error)
    res.status(500).json({ message: 'Error retrieving collection' })
  }
}

//Add recipe into collection
collectionCtrl.addRecipe = async (req, res) => {
  const { collection_id, recipe_id } = req.body
  const userId = req.user && req.user.id

  try {
    // Check if authenticated user owns the collection
    const selectCollectionQuery =
      'SELECT user_id FROM collection WHERE collection_id = $1'
    const selectCollectionValues = [collection_id]
    const selectCollectionResult = await db.query(
      selectCollectionQuery,
      selectCollectionValues
    )

    const collectionUserId = selectCollectionResult[0].user_id

    if (userId !== collectionUserId) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    // Add the recipe to the collection
    await db.none(
      'INSERT INTO collection_recipe (collection_id, recipe_id) VALUES ($1, $2)',
      [collection_id, recipe_id]
    )

    console.log(`Recipe ${recipe_id} added to collection ${collection_id}`)
    res.status(200).json({ message: 'Recipe added to collection' })
  } catch (error) {
    console.error('Error adding recipe to collection:', error)
    res.status(500).json({ message: 'Error adding recipe to collection' })
  }
}

//Remove recipe from collection
collectionCtrl.removeRecipe = async (req, res) => {
  const { collection_id, recipe_id } = req.body
  const userId = req.user && req.user.id

  try {
    // Check if authenticated user owns the collection
    const selectCollectionQuery =
      'SELECT user_id FROM collection WHERE collection_id = $1'
    const selectCollectionValues = [collection_id]
    const selectCollectionResult = await db.query(
      selectCollectionQuery,
      selectCollectionValues
    )

    const collectionUserId = selectCollectionResult[0].user_id

    if (userId !== collectionUserId) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const result = await db.result(
      'DELETE FROM collection_recipe WHERE collection_id = $1 AND recipe_id = $2 ',
      [collection_id, recipe_id]
    )
    console.log(`Removed recipe ${recipe_id} from collection ${collection_id}`)
    if (result.rowCount === 0) {
      res.status(404).json({ message: 'Recipe not found in collection' })
    } else {
      res.status(200).json({ message: 'Recipe removed from collection' })
    }
  } catch (error) {
    console.error('Error removing recipe from collection:', error)
    res.status(500).json({ message: 'Error removing recipe from collection' })
  }
}

//Update collection
collectionCtrl.updateCollection = async (req, res) => {
  const { name, note } = req.body
  const collection_id = req.params.id
  const userId = req.user && req.user.id

  try {
    const client = await db.connect()
    await client.query('BEGIN')

    // Check if authenticated user owns the collection
    const selectCollectionQuery =
      'SELECT user_id FROM collection WHERE collection_id = $1'
    const selectCollectionValues = [collection_id]
    const selectCollectionResult = await db.query(
      selectCollectionQuery,
      selectCollectionValues
    )
    console.log(selectCollectionResult)

    if (!selectCollectionResult || !selectCollectionResult.length) {
      return res.status(404).json({ message: 'Collection not found' })
    }

    const collectionUserId = selectCollectionResult[0].user_id

    if (userId !== collectionUserId) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    // Update the collection
    const updateCollectionQuery =
      'UPDATE collection SET name = $1, note = $2 WHERE collection_id = $3'
    const updateCollectionValues = [name, note, collection_id]
    await client.query(updateCollectionQuery, updateCollectionValues)

    await client.query('COMMIT')

    res.status(200).json({ message: 'Collection updated' })
  } catch (error) {
    console.error('Error updating collection:', error)
    res.status(500).json({ message: 'Error updating collection' })
  }
}

//Get all recipe available in 1 collection, if needed
collectionCtrl.getRecipesInCollection = async (req, res) => {
  const collection_id = req.params.collection_id
  const userId = req.user && req.user.id

  try {
    const selectCollectionQuery =
      'SELECT user_id FROM collection WHERE collection_id = $1'
    const selectCollectionValues = [collection_id]
    const selectCollectionResult = await db.query(
      selectCollectionQuery,
      selectCollectionValues
    )

    const collectionUserId = selectCollectionResult[0].user_id

    if (collectionUserId !== userId) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const recipes = await db.any(
      'SELECT recipe.* FROM recipe JOIN collection_recipe ON recipe.recipe_id = collection_recipe.recipe_id WHERE collection_recipe.collection_id = $1',
      [collection_id]
    )
    console.log(`Retrieved recipes for collection with ID ${collection_id}`)
    res.json(recipes)
  } catch (error) {
    console.error('Error retrieving recipes for collection:', error)
    res.status(500).json({ message: 'Error retrieving recipes for collection' })
  }
}

//Remove collection
collectionCtrl.removeCollection = async (req, res) => {
  const collectionId = req.params.id
  const userId = req.user && req.user.id

  try {
    const client = await db.connect()
    await client.query('BEGIN')

    // Check if collection exists and retrieve its user_id
    const selectCollectionQuery =
      'SELECT user_id FROM collection WHERE collection_id = $1'
    const selectCollectionValues = [collectionId]
    const selectCollectionResult = await client.query(
      selectCollectionQuery,
      selectCollectionValues
    )

    const collectionUserId = selectCollectionResult[0].user_id

    // Check if authenticated user is the owner of the collection
    if (userId !== collectionUserId) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    // Delete collection from collection_recipe table
    const deleteCollectionRecipeQuery =
      'DELETE FROM collection_recipe WHERE collection_id = $1'
    const deleteCollectionRecipeValues = [collectionId]
    await client.query(
      deleteCollectionRecipeQuery,
      deleteCollectionRecipeValues
    )

    // Delete the collection
    const deleteCollectionQuery =
      'DELETE FROM collection WHERE collection_id = $1'
    const deleteCollectionValues = [collectionId]
    await client.query(deleteCollectionQuery, deleteCollectionValues)

    await client.query('COMMIT')

    res.status(200).json({ message: 'Collection deleted' })
  } catch (error) {
    console.error('Error deleting collection:', error)
    res.status(500).json({ message: 'Error deleting collection' })
  }
}

collectionCtrl.saveCollectionImg = async (req, res) => {
  try {
    const { collectionId } = req.params
    const file = req.file
    const collection = await db.oneOrNone(
      'SELECT * FROM collection WHERE collection_id = $1',
      [collectionId]
    )
    if (!collection) {
      return res.status(400).send('Invalid collection.')
    }
    const collectionImgUrl = await db.oneOrNone(
      'SELECT image_link FROM collection WHERE collection_id = $1',
      [collectionId]
    )

    if (collectionImgUrl) {
      // If old image exists, Delete the old one on Firestore Cloud
      const oldStorageRef = ref(storage, `${collectionImgUrl.image_link}`)
      // Delete the file
      deleteObject(oldStorageRef)
        .then(() => {
          console.log('Delete the old image on Firebase Cloud successfully.')
        })
        .catch(error => {
          console.log(error)
        })
    }

    // Save Collection Image to the Firebase Cloud
    console.log('running save collection image', req.file)
    const storageRef = ref(
      storage,
      `/collections/${uuidv4()}-${file.originalname}`
    )

    uploadBytes(storageRef, file.buffer)

    const firestoreUrl = storageRef.fullPath
    await db.none(
      'UPDATE collection SET image_link=$2 WHERE collection_id=$1',
      [collectionId, firestoreUrl]
    )

    res.status(200).json({ msg: 'Uploaded successfully' })
  } catch (err) {
    console.log(err)
    res.status(500).json({ msg: err })
  }
}

//Get collection img
collectionCtrl.getCollectionImg = async (req, res) => {
  try {
    const { collectionId } = req.params
    const collection = await db.oneOrNone(
      'SELECT * FROM collection WHERE collection_id = $1',
      [collectionId]
    )
    if (!collection) {
      return res.status(400).send('Invalid collection id.')
    }
    const collectionImgUrl = await db.oneOrNone(
      'SELECT image_link FROM collection WHERE collection_id = $1',
      [collectionId]
    )

    const image_link = collectionImgUrl.image_link
    const collection_default = 'default-collection-image.jpg'
    const storageRef = ref(
      storage,
      `${!image_link ? collection_default : image_link}`
    )
    console.log(image_link)
    getDownloadURL(storageRef).then(url => {
      console.log('Image URL:', url)
      res.status(200).json(url)
    })
    console.log('imageRef Full Path:', storageRef.fullPath)
  } catch (err) {
    return res.status(500).json({ msg: err.message })
  }
}

module.exports = collectionCtrl
