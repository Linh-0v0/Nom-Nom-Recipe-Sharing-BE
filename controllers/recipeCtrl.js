const db = require('../db')

const user_auth = require('../middleware/user_auth')
const { calculateRecipeCalories } = require('../services/recipe-calculator')
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

recipeCtrl.recipeRecBasedUserCountry = async (req, res) => {
  try {
    const { userId } = req.params
    const user = await db.oneOrNone('SELECT * FROM users WHERE id = $1', [
      userId
    ])
    if (!user) {
      return res.status(400).send('Invalid user email.')
    }

    // Retrieve recipes that match the user's dietary preferences
    const recommendedRecipes = await db.any(
      `
      SELECT r.*
      FROM recipe r
      JOIN recipe_country rc ON r.recipe_id = rc.recipe_id
      JOIN user_country_preferences ucp ON rc.country_pref_id = ucp.country_preference_id
      WHERE ucp.user_id = $1
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

recipeCtrl.insertIngredient = async (req, res) => {
  try {
    const { recipeId, ingredientId, quantity, unit_name } = req.body

    const result = await db.result(
      'INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_name) VALUES ($1, $2, $3, $4)',
      [recipeId, ingredientId, quantity, unit_name]
    )
    res.status(200).json({ msg: 'Insert ingredient to recipe successfully.' })
  } catch (err) {
    res.status(500).json({ msg: err })
  }
}

recipeCtrl.insertCountry = async (req, res) => {
  try {
    const { recipeId, countryId } = req.body

    const countryOfRecipe = await db.oneOrNone(
      'SELECT country_pref_id FROM recipe_country WHERE recipe_id=$1',
      [recipeId]
    )
    if (!countryOfRecipe) {
      const result = await db.result(
        'INSERT INTO recipe_country (recipe_id, country_pref_id) VALUES ($1, $2)',
        [recipeId, countryId]
      )
    } else {
      const result = await db.result(
        'UPDATE recipe_country SET country_pref_id=$2 WHERE recipe_id=$1',
        [recipeId, countryId]
      )
    }

    res
      .status(200)
      .json({ msg: 'Insert&Update country to recipe successfully.' })
  } catch (err) {
    res.status(500).json({ msg: err })
  }
}

recipeCtrl.updateDietary = async (req, res) => {
  const { recipeId } = req.params
  const { dietaryType } = req.body //can be array: [Gluten, Vegan] <- dietaryName

  const recipe = await db.oneOrNone('SELECT * FROM recipe WHERE recipe_id = $1', [
    recipeId
  ])
  if (!recipe) {
    return res.status(400).send('Invalid recipe Id.')
  }
  // create an empty array to store promises for updating each dietary preference name
  const promises = []

  // retrieve the existing dietaryTypeName values for the user from the database
  db.any(
    'SELECT dietary_pref FROM recipe_dietary WHERE recipe_id = $1',
    recipeId
  )
    .then(existingdietaryTypes => {
      const existingdietaryTypeNames = existingdietaryTypes.map(
        pref => pref.dietary_pref
      )

      // loop through the new dietaryTypeName array
      for (let i = 0; i < dietaryType.length; i++) {
        const name = dietaryType[i]

        // check if the new name already exists in the database
        if (existingdietaryTypeNames.includes(name)) {
          // if it does, remove it from the existing names array to prevent it from being deleted
          existingdietaryTypeNames.splice(
            existingdietaryTypeNames.indexOf(name),
            1
          )
        } else {
          // if it doesn't, generate the insert query for this name
          const insertQuery = `INSERT INTO recipe_dietary (recipe_id, dietary_pref) VALUES ($1, $2)`
          const insertValues = [recipeId, name]

          // add the promise for this insert to the promises array
          promises.push(db.none(insertQuery, insertValues))
        }

        // generate the update query string for this dietary preference name
        const updateQuery = `UPDATE recipe_dietary SET dietary_pref = $1 WHERE recipe_id = $2 AND dietary_pref = $3`
        const updateValues = [name, recipeId, name]

        // add the promise for this update to the promises array
        promises.push(db.none(updateQuery, updateValues))
      }

      // generate the delete query strings for the remaining existing dietary preference names
      const deleteQueries = existingdietaryTypeNames.map(name => ({
        query: `DELETE FROM recipe_dietary WHERE recipe_id = $1 AND dietary_pref = $2`,
        values: [recipeId, name]
      }))

      // add the promises for the delete queries to the promises array
      deleteQueries.forEach(deleteQuery => {
        promises.push(db.none(deleteQuery.query, deleteQuery.values))
      })

      // execute all of the queries using Promise.all
      Promise.all(promises)
        .then(() => {
          console.log('Recipe Dietaries updated successfully')
          res.status(200).send('Recipe Dietaries updated successfully')
        })
        .catch(error => {
          console.error(error)
          res.status(500).send('Internal server error')
        })
    })
    .catch(error => {
      console.error(error)
      res.status(500).send('Internal server error')
    })
}

recipeCtrl.getTotalIngCaloPerRecipe = async (req, res) => {
  try {
    const { recipeId } = req.params
    const totalCalories = await calculateRecipeCalories(recipeId)
    res.status(200).json(totalCalories)
  } catch (err) {
    res.status(500).json({ msg: err })
  }
}

recipeCtrl.getTotalCaloriesBasedServ = async (req, res) => {
  try {
    const { recipeId } = req.params
    const { servingSize } = req.body
    const servingSizeNum = parseFloat(servingSize)

    const totalCaloriesPerServ = await calculateRecipeCalories(recipeId)

    const recipe = await db.oneOrNone(
      'SELECT serving_size, serving_unit FROM recipe WHERE recipe_id=$1',
      [recipeId]
    )
    console.log('------TOTALCALPerServ:', servingSizeNum)
    const defaultServingSize = recipe.serving_size
    const newServingSizeMin = Math.floor(recipe.serving_size * servingSize)
    const newServingSizeMax = Math.ceil(recipe.serving_size * servingSize)
    const servingUnit = recipe.serving_unit
    const unRoundedTotalCal = servingSizeNum * totalCaloriesPerServ
    const totalCalories = Math.ceil(unRoundedTotalCal * 100) / 100

    res.status(200).json({
      defaultServingSize,
      newServingSizeMin,
      newServingSizeMax,
      servingUnit,
      totalCalories
    })
  } catch (err) {
    res.status(500).json({ msg: err })
  }
}

recipeCtrl.getByIngredients = async (req, res) => {
  try {
    const client = await db.connect()
    const ingredients = req.body.ingredients
    const result = await client.query(
      'SELECT * FROM find_recipes_with_ingredients($1)',
      [ingredients]
    )
    console.log(result) // Log the result object to the console
    res.status(200).json(result)
  } catch (err) {
    console.error(err)
    res.status(500).send('Error retrieving recipes')
  }
}

module.exports = recipeCtrl
