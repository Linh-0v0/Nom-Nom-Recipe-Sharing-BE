const db = require('../db')
const user_auth = require('../middleware/user_auth')
const recipeCtrl = {}

//Function insert recipe
// Create a new recipe
recipeCtrl.createRecipe = async (req, res) => {
  user_auth(req, res, async () => {
    const userId = req.user && req.user.id
    const name = req.body.name
    const servingSize = req.body.servingSize
    const duration = req.body.duration
    const imageLink = req.body.imageLink
    const description = req.body.description

    if (!name) {
      return res.status(400).json({ message: 'Name is required' })
    }

    try {
      const insertRecipeQuery = `
        INSERT INTO recipe (author_id, name, serving_size, duration, image_link, description)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING recipe_id
      `
      const insertRecipeValues = [
        userId,
        name,
        servingSize,
        duration,
        imageLink,
        description
      ]
      const insertRecipeResult = await db.query(
        insertRecipeQuery,
        insertRecipeValues
      )
      const recipeId = insertRecipeResult[0].recipe_id

      res.status(201).json({ message: 'Recipe created', recipeId })
    } catch (error) {
      console.error('Error creating recipe:', error)
      res.status(500).json({ message: 'Error creating recipe' })
    }
  })
}

//Function get recipe by name
recipeCtrl.getByName = async (req, res) => {
  const word = req.params.word
  try {
    const recipes = await db.any('SELECT * FROM recipe WHERE name ILIKE $1', [
      `%${word}%`
    ])
    if (recipes.length > 0) {
      res.status(200).json(recipes)
      console.log('Retrived by name successfully')
    } else {
      res.status(404).json({ message: 'No recipes found' })
    }
  } catch (error) {
    console.error('Error retrieving recipes:', error)
    res.status(500).json({ message: 'Error retrieving recipes' })
  }
}

//Function get by user
recipeCtrl.getByUser = async (req, res) => {
  const { author_id } = req.params
  const recipes = await db.any(`SELECT * FROM recipe WHERE author_id = $1`, [
    author_id
  ])
  if (recipes) {
    res.status(200).json(recipes)
  } else {
    res.status(404).send('Recipe not found')
  }
}

//Function get all recipes
recipeCtrl.getAll = async (req, res) => {
  try {
    const recipes = await db.any('SELECT * FROM RECIPE')
    console.log('Retrieved all recipes')
    res.json(recipes)
  } catch (err) {
    console.error('Error retrieving recipes', err.message)
    res.sendStatus(500)
  }
}

//Fuction get 1 recipe by id
recipeCtrl.get = async (req, res) => {
  const { recipe_id } = req.params
  const recipe = await db.one(`SELECT * FROM recipe WHERE recipe_id = $1`, [
    recipe_id
  ])
  if (recipe) {
    res.status(200).json(recipe)
  } else {
    res.status(404).send('Recipe not found')
  }
}

//Fuction update recipe
recipeCtrl.updateRecipe = async (req, res) => {
  const userId = req.user && req.user.id
  const recipeId = req.params.recipe_id
  const { name, serving_size, duration, image_link, description } = req.body

  try {
    // Check if the recipe exists
    const recipe = await db.oneOrNone(
      'SELECT * FROM recipe WHERE recipe_id = $1',
      [recipeId]
    )

    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' })
    }

    // Check if the user is the author of the recipe
    if (recipe.author_id !== userId) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    // Update the recipe
    const updateRecipeQuery =
      'UPDATE recipe SET name = $1, serving_size = $2, duration = $3, image_link = $4, description = $5, updated_at = NOW() WHERE recipe_id = $6'
    const updateRecipeValues = [
      name,
      serving_size,
      duration,
      image_link,
      description,
      recipeId
    ]
    await db.none(updateRecipeQuery, updateRecipeValues)

    res.status(200).json({ message: 'Recipe updated' })
  } catch (error) {
    console.error('Error updating recipe:', error)
    res.status(500).json({ message: 'Error updating recipe' })
  }
}

//Fuction delete recipe
recipeCtrl.deleteRecipe = async (req, res) => {
  const recipeId = req.params.recipe_id
  const userId = req.user && req.user.id

  try {
    const client = await db.connect()
    await client.query('BEGIN')

    // Check if recipe exists and retrieve its author_id
    const selectRecipeQuery =
      'SELECT author_id FROM recipe WHERE recipe_id = $1'
    const selectRecipeValues = [recipeId]
    const selectRecipeResult = await client.query(
      selectRecipeQuery,
      selectRecipeValues
    )

    const recipeAuthorId = selectRecipeResult[0].author_id

    // Check if authenticated user is the author of the recipe
    if (userId !== recipeAuthorId) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    // Delete recipe from collection_recipe table
    const deleteCollectionRecipeQuery =
      'DELETE FROM collection_recipe WHERE recipe_id = $1'
    const deleteCollectionRecipeValues = [recipeId]
    await client.query(
      deleteCollectionRecipeQuery,
      deleteCollectionRecipeValues
    )

    // Delete the recipe
    const deleteRecipeQuery = 'DELETE FROM recipe WHERE recipe_id = $1'
    const deleteRecipeValues = [recipeId]
    await client.query(deleteRecipeQuery, deleteRecipeValues)

    await client.query('COMMIT')

    res.status(200).json({ message: 'Recipe deleted' })
  } catch (error) {
    console.error('Error deleting recipe:', error)
    res.status(500).json({ message: 'Error deleting recipe' })
  }

  try {
    await db.none(`DELETE FROM recipe WHERE recipe_id = $1`, [recipe_id])
    console.log(`Deleted recipe with recipe_id ${recipe_id}`)
    res.sendStatus(204)
  } catch (err) {
    console.error(
      `Error deleting recipe with recipe_id ${recipe_id}:`,
      err.message
    )
    res.sendStatus(500)
  }
}

recipeCtrl.recipeRecBasedUserDietary = async (req, res) => {
  try {
    const { userId } = req.params
    const user = await db.oneOrNone('SELECT * FROM users WHERE id = $1', [
      userId
    ])
    if (!user) {
      return res.status(400).send('Invalid user email.')
    }

    // Retrieve the user's dietary preferences from the dietary_preference table
    const userDietaryPreferences = await db.manyOrNone(
      'SELECT dietary_preference_name FROM user_dietary_preferences WHERE user_id = $1',
      [userId]
    )

    // Retrieve recipes that match the user's dietary preferences
    const recommendedRecipes = await db.any(
      `
      SELECT r.*
      FROM recipe r
      JOIN recipe_dietary rd ON r.recipe_id = rd.recipe_id
      JOIN user_dietary_preferences udp ON rd.dietary_pref = udp.dietary_preference_name
      WHERE udp.user_id = $1
    `,
      [userId]
    )

    res.status(200).json({
      message: `Recipe recommendations for user ${userId}`,
      data: recommendedRecipes
    })
  } catch (error) {
    res.status(500).send({ msg: error.message })
  }
}

module.exports = recipeCtrl
