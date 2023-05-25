const db = require('../db')
const {
  uploadBytes,
  ref,
  getDownloadURL,
  deleteObject
} = require('firebase/storage')
const { v4: uuidv4 } = require('uuid')
const { storage } = require('../firebaseConfig')
const user_auth = require('../middleware/user_auth')
const {
  calculateRecipeCalories,
  calNutritionFactTotalOfEach
} = require('../services/recipe-calculator')
const recipeCtrl = {}

// Create a new recipe
recipeCtrl.createRecipe = async (req, res) => {
  user_auth(req, res, async () => {
    const userId = req.user && req.user.id
    const name = req.body.name
    const servingSize = req.body.servingSize
    const servingUnit = req.body.servingUnit
    const duration = req.body.duration
    const imageLink = req.body.imageLink
    const description = req.body.description
    const ingredients = req.body.ingredients // array of ingredient objects
    const dietaryPrefs = req.body.dietaryPrefs // array of dietary preference names
    const countryPrefs = req.body.countryPrefs // array of country preference IDs

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
        servingUnit,
        duration,
        imageLink,
        description
      ]
      const insertRecipeResult = await db.query(
        insertRecipeQuery,
        insertRecipeValues
      )
      const recipeId = insertRecipeResult[0].recipe_id

      // loop through ingredients array and insert into database
      for (let i = 0; i < ingredients.length; i++) {
        const { ingredientId, quantity, unit_name } = ingredients[i]
        await db.query(
          'INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_name) VALUES ($1, $2, $3, $4)',
          [recipeId, ingredientId, quantity, unit_name]
        )
      }

      // loop through dietaryPrefs array and insert into database
      for (let i = 0; i < dietaryPrefs.length; i++) {
        await db.query(
          'INSERT INTO recipe_dietary (recipe_id, dietary_pref) VALUES ($1, $2)',
          [recipeId, dietaryPrefs[i]]
        )
      }

      // loop through countryPrefs array and insert into database
      for (let i = 0; i < countryPrefs.length; i++) {
        await db.query(
          'INSERT INTO recipe_country (recipe_id, country_pref_id) VALUES ($1, $2)',
          [recipeId, countryPrefs[i]]
        )
      }

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
  const { name, serving_size, serving_unit, duration, image_link, description } = req.body

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
      'UPDATE recipe SET name = $1, serving_size = $2, serving_unit = $3, duration = $4, image_link = $5, description = $6, updated_at = NOW() WHERE recipe_id = $7'
    const updateRecipeValues = [
      name,
      serving_size,
      serving_unit,
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

recipeCtrl.deleteIngredient = async (req, res) => {
  const { recipeId, ingredientId } = req.params
  try {
    const result = await db.result(
      'DELETE FROM recipe_ingredients WHERE recipe_id = $1 AND ingredient_id=$2',
      [recipeId, ingredientId]
    )
    //check boolean if the row is deleted
    if (result.rowCount === 1)
      res.status(200).json({ msg: 'Delete Successfully' })
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

  const recipe = await db.oneOrNone(
    'SELECT * FROM recipe WHERE recipe_id = $1',
    [recipeId]
  )
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

recipeCtrl.getIngredientsOfRecipe = async (req, res) => {
  try {
    const { recipeId } = req.params

    const ingredients = await db.manyOrNone(
      `SELECT i.* FROM ingredients i 
      JOIN recipe_ingredients ri ON i.id = ri.ingredient_id 
      JOIN recipe r ON r.recipe_id = ri.recipe_id 
      WHERE r.recipe_id=$1`,
      [recipeId]
    )
    res.status(200).json({ ingredients })
  } catch (err) {
    res.status(500).send({ msg: err })
  }
}

// NHAM
recipeCtrl.getOriginOfRecipe = async (req, res) => {
  try {
    const { recipeId } = req.params

    const result = await db.manyOrNone(
      `SELECT c.name, c.id FROM countries c 
    JOIN recipe_country rc ON c.id=rc.country_pref_id
    JOIN recipe r ON r.recipe_id = rc.recipe_id
    WHERE r.recipe_id=$1
    `,
      [recipeId]
    )

    res.status(200).json(result)
  } catch (err) {
    res.status(500).send({ msg: err })
  }
}

recipeCtrl.getDietaryOfRecipe = async (req, res) => {
  try {
    const { recipeId } = req.params

    const result = await db.manyOrNone(
      `SELECT d.name FROM dietary_pref d
      JOIN recipe_dietary rd ON d.name=rd.dietary_pref
      JOIN recipe r ON r.recipe_id = rd.recipe_id
      WHERE r.recipe_id=$1
      `,
      [recipeId]
    )

    res.status(200).json(result)
  } catch (err) {
    res.status(500).send({ msg: err })
  }
}


// all ingredients values is added into one 'nutrition facts table based on recipeServing
recipeCtrl.getTotalNutrtionFactOfRecipe = async (req, res) => {
  try {
    const { recipeId } = req.params
    const { servingNum } = req.body
    const servingSizeNum = parseFloat(servingNum)
    const ingredientFactsOfRecipe = []
    const nutritions = {
      calories: 0,
      carb: 0,
      protein: 0,
      fat: 0,
      sugar: 0,
      sodium: 0,
      fiber: 0,
      cholesterol: 0,
      vitamin_a: 0,
      vitamin_b12: 0,
      vitamin_b6: 0,
      vitamin_c: 0,
      vitamin_d: 0,
      vitamin_e: 0,
      vitamin_k: 0,
      potassium: 0,
      calcium: 0,
      iron: 0
    }

    const ingredients = await db.manyOrNone(
      `SELECT i.*, ri.quantity AS recipe_ing_quantity, ri.unit_name AS recipe_ing_unit_name FROM ingredients i JOIN recipe_ingredients ri ON i.id = ri.ingredient_id WHERE ri.recipe_id = $1`,
      [recipeId]
    )

    for (const ingredient of ingredients) {
      const nutrition = await calNutritionFactTotalOfEach(
        ingredient,
        servingSizeNum
      )
      nutritions.calories += nutrition.calories
      nutritions.carb += nutrition.carb
      nutritions.protein += nutrition.protein
      nutritions.fat += nutrition.fat
      nutritions.sugar += nutrition.sugar
      nutritions.sodium += nutrition.sodium
      nutritions.fiber += nutrition.fiber
      nutritions.cholesterol += parseFloat(nutrition.cholesterol)
      nutritions.vitamin_a += nutrition.vitamin_a
      nutritions.vitamin_b12 += nutrition.vitamin_b12
      nutritions.vitamin_b6 += nutrition.vitamin_b6
      nutritions.vitamin_c += nutrition.vitamin_c
      nutritions.vitamin_d += nutrition.vitamin_d
      nutritions.vitamin_e += nutrition.vitamin_e
      nutritions.vitamin_k += nutrition.vitamin_k
      nutritions.potassium += nutrition.potassium
      nutritions.calcium += nutrition.calcium
      nutritions.iron += nutrition.iron
      console.log('Nutrition in recipeCtrl:', nutritions)
    }
    ingredientFactsOfRecipe.push(nutritions)

    res.status(200).json({ ingredientFactsOfRecipe })
  } catch (err) {
    res.status(500).send({ msg: err })
  }
}

// list the total value of each ingredients based on recipeServing
recipeCtrl.getTotalNutrtionFactOfRecipeIng = async (req, res) => {
  try {
    const { recipeId } = req.params
    const { servingNum } = req.body
    const servingSizeNum = parseFloat(servingNum)
    const ingredientFactsOfRecipe = []

    const ingredients = await db.manyOrNone(
      `SELECT i.*, ri.quantity AS recipe_ing_quantity, ri.unit_name AS recipe_ing_unit_name FROM ingredients i JOIN recipe_ingredients ri ON i.id = ri.ingredient_id WHERE ri.recipe_id = $1`,
      [recipeId]
    )

    for (const ingredient of ingredients) {
      console.log('Ingredient in RecipeCtrl:', ingredient)
      const nutritions = await calNutritionFactTotalOfEach(
        ingredient,
        servingSizeNum
      )
      ingredientFactsOfRecipe.push(nutritions)
    }

    res.status(200).json({ ingredientFactsOfRecipe })
  } catch (err) {
    res.status(500).send({ msg: err })
  }
}

recipeCtrl.getRecipeByCountry = async (req, res) => {
  const countryPrefId = req.params.countryPrefId

  try {
    await db.query('BEGIN')

    const recipesResult = await db.query(
      'SELECT recipe.* FROM recipe JOIN recipe_country ON recipe.recipe_id = recipe_country.recipe_id WHERE recipe_country.country_pref_id = $1',
      [countryPrefId]
    )

    await db.query('COMMIT')

    res.json(recipesResult)
  } catch (err) {
    await db.query('ROLLBACK')
    console.error(err)
    res.status(500).send('Error retrieving recipes by country preference')
  }
}

recipeCtrl.getRecipeByDietary = async (req, res) => {
  const dietaryPref = req.params.dietaryPref

  try {
    await db.query('BEGIN')

    const recipesResult = await db.query(
      'SELECT recipe.* FROM recipe JOIN recipe_dietary ON recipe.recipe_id = recipe_dietary.recipe_id WHERE recipe_dietary.dietary_pref = $1',
      [dietaryPref]
    )

    await db.query('COMMIT')

    res.json(recipesResult)
  } catch (err) {
    console.error(err)
    res.status(500).send('Error retrieving recipes by dietary preference')
  }
}

//Post or update recipe img
recipeCtrl.saveRecipeImg = async (req, res) => {
  try {
    const { recipeId } = req.params
    const file = req.file
    const recipe = await db.oneOrNone(
      'SELECT * FROM recipe WHERE recipe_id = $1',
      [recipeId]
    )
    if (!recipe) {
      return res.status(400).send('Invalid recipe.')
    }
    const recipeImgUrl = await db.oneOrNone(
      'SELECT image_link FROM recipe WHERE recipe_id = $1',
      [recipeId]
    )

    if (recipeImgUrl) {
      // If old image exists, Delete the old one on Firestore Cloud
      const oldStorageRef = ref(storage, `${recipeImgUrl.img_url}`)
      // Delete the file
      deleteObject(oldStorageRef)
        .then(() => {
          console.log('Delete the old image on Firebase Cloud successfully.')
        })
        .catch(error => {
          console.log(error)
        })
    }

    // Save Recipe Image to the Firebase Cloud
    console.log('running save recipe image', req.file)
    const storageRef = ref(storage, `/recipes/${uuidv4()}-${file.originalname}`)

    uploadBytes(storageRef, file.buffer)

    const firestoreUrl = storageRef.fullPath
    await db.none('UPDATE recipe SET image_link=$2 WHERE recipe_id=$1', [
      recipeId,
      firestoreUrl
    ])

    res.status(200).json({ msg: 'Uploaded successfully' })
  } catch (err) {
    console.log(err)
    res.status(500).json({ msg: err })
  }
}

//Get recipe img
recipeCtrl.getRecipeImg = async (req, res) => {
  try {
    const { recipeId } = req.params
    const recipe = await db.oneOrNone(
      'SELECT * FROM recipe WHERE recipe_id = $1',
      [recipeId]
    )
    if (!recipe) {
      return res.status(400).send('Invalid recipe id.')
    }
    const recipeImgUrl = await db.oneOrNone(
      'SELECT image_link FROM recipe WHERE recipe_id = $1',
      [recipeId]
    )

    const image_link = recipeImgUrl.image_link
    const recipe_default = 'default-recipe-image.jpg'
    const storageRef = ref(storage, `${!image_link ? recipe_default : image_link}`)
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


//Search recipe base on all requirements
recipeCtrl.searchRecipes = async (req, res) => {
  const { name, countryId, dietaryPref } = req.body;
  try{
    const whereClauses = [];
    
    if (name) {
      whereClauses.push(`recipe.name ILIKE '%${name}%'`);
    }
    if (countryId) {
      whereClauses.push(`recipe.recipe_id IN (SELECT recipe_id FROM recipe_country WHERE country_pref_id = ${countryId})`);
    }
    if (dietaryPref) {
      whereClauses.push(`recipe.recipe_id IN (SELECT recipe_id FROM recipe_dietary WHERE dietary_pref = '${dietaryPref}')`);
    }

    const whereClause = whereClauses.join(" AND ");
    const recipes = await db.any(`
      SELECT recipe.recipe_id, recipe.author_id, recipe.name, recipe.created_at, recipe.updated_at, recipe.serving_size, recipe.serving_unit, recipe.duration, recipe.image_link, recipe.description, recipe_country.country_pref_id, recipe_dietary.dietary_pref
      FROM recipe
      JOIN recipe_country ON recipe.recipe_id = recipe_country.recipe_id
      LEFT JOIN recipe_dietary ON recipe.recipe_id = recipe_dietary.recipe_id
      WHERE ${whereClause}
    `);

    res.status(200).json(recipes)
  } catch (error) {
    console.error('Error retrieving recipes:', error);
    res.status(500).json({ message: 'Error retrieving recipes' });
  }
};


module.exports = recipeCtrl
