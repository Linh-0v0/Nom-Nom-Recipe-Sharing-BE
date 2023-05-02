const db = require('../db') // Import your database connection
const { convertUnitToCorrespQuantity } = require('./unit-converter') // Import the function to convert ingredient quantities to calories

async function calculateRecipeCalories(recipeId) {
  try {
    // Retrieve all the ingredients of the recipe with their quantities and unit names
    const ingredients = await db.any(
      'SELECT i.id, i.ing_name, i.calories, i.quantity, i.unit_name, ri.quantity AS recipe_quantity, ri.unit_name AS recipe_unit_name FROM ingredients i JOIN recipe_ingredients ri ON i.id = ri.ingredient_id WHERE ri.recipe_id = $1',
      [recipeId]
    )

    console.log('Ingredients:', ingredients)

    let totalCalories = 0
    // Calculate the total calories of the recipe based on its ingredients
    for (const ingredient of ingredients) {
      const ingredientCalories = ingredient.calories
      console.log('ING:', ingredient.quantity)
      //Convert Ingredient To Gram
      const ingQuantityInGrams = convertUnitToCorrespQuantity(
        ingredient.unit_name,
        ingredient.quantity,
        'grams'
      )

      //Convert RecipeIngredient To Gram
      const recipeQuantityInGrams = convertUnitToCorrespQuantity(
        ingredient.recipe_unit_name,
        ingredient.recipe_quantity,
        'grams'
      )

      //Total Calories Of Ing in Recipe
      // const ingredientTotalCalories =
      //   (recipeQuantityInGrams / 100) * ingredientCalories
      const ingredientTotalCalories =
        (recipeQuantityInGrams * ingredientCalories) / ingQuantityInGrams
      console.log('ingTotalCal:', ingredientTotalCalories)

      totalCalories += ingredientTotalCalories
    }
    return totalCalories
  } catch (error) {
    console.log(error)
  }
}

//Return "total of a nutrition" in grams of "A Ingredient in Recipe"
async function calNutritionFactTotalOfEach(ingredient, recipeServingNum) {
  try {
    const nutritions = {}
    const nutrientProps = [
      'ing_name',
      'quantity',
      'unit_name',
      'calories',
      'carb',
      'protein',
      'fat',
      'sugar',
      'sodium',
      'fiber',
      'cholesterol',
      'vitamin_a',
      'vitamin_b12',
      'vitamin_b6',
      'vitamin_c',
      'vitamin_d',
      'vitamin_e',
      'vitamin_k',
      'potassium',
      'calcium',
      'iron'
    ]

    // Calculate the total calories of the recipe based on its ingredients
    const ingQuantity = ingredient.quantity
    const ingUnit = ingredient.unit_name
    const recipeIngQuantity = ingredient.recipe_ing_quantity
    const recipeUnitName = ingredient.recipe_ing_unit_name
    // -------- //
    for (const nutrient of nutrientProps) {
      if (nutrient == 'unit_name') {
        nutritions[nutrient] = 'grams'
      } else if (nutrient == 'ing_name') {
        nutritions[nutrient] = ingredient.ing_name
      } else {
        const ingNutrientParsed = parseFloat(ingredient[nutrient])

        const ingQuantityInGrams = convertUnitToCorrespQuantity(
          ingUnit,
          ingQuantity,
          'grams'
        )
        // console.log('quantityIngredGram:', ingQuantityInGrams)

        //Convert RecipeIngredient To Gram
        const recipeQuantityInGrams = convertUnitToCorrespQuantity(
          recipeUnitName,
          recipeIngQuantity,
          'grams'
        )
        // console.log('quantityIngredGram:', recipeQuantityInGrams)
        const recipeIng_Ing_ratio = ingQuantityInGrams / recipeQuantityInGrams

        const totalNutritionInGrams = ingNutrientParsed / recipeIng_Ing_ratio

        const totalNutritionBasedServing = totalNutritionInGrams * recipeServingNum

        nutritions[nutrient] = Math.ceil(totalNutritionBasedServing * 100) / 100
      }
    }
    return nutritions
  } catch (error) {
    console.log(error)
  }
}

module.exports = { calculateRecipeCalories, calNutritionFactTotalOfEach }
