const db = require('../db') // Import your database connection
const { convertUnitToCorrespQuantity } = require('./unit-converter') // Import the function to convert ingredient quantities to calories

async function calculateRecipeCalories(recipeId) {
  try {
    // Retrieve all the ingredients of the recipe with their quantities and unit names
    const ingredients = await db.any(
      'SELECT i.id, i.calories, i.quantity, i.unit_name, ri.quantity, ri.unit_name FROM ingredients i JOIN recipe_ingredients ri ON i.id = ri.ingredient_id WHERE ri.recipe_id = $1',
      [recipeId]
    )

    console.log('Ingredients:', ingredients)

    let totalCalories = 0
    // Calculate the total calories of the recipe based on its ingredients
    for (const ingredient of ingredients) {
      const ingredientCalories = ingredient.calories
      const ingredientQuantity = ingredient.quantity
      console.log('ING:', ingredient.quantity)
      const quantityInGrams = convertUnitToCorrespQuantity(
        ingredient.unit_name,
        ingredient.quantity,
        'grams'
      )
      console.log('quantityInGram:', quantityInGrams)
      const ingredientTotalCalories =
        (quantityInGrams / ingredientQuantity) * ingredientCalories
      totalCalories += ingredientTotalCalories
    }
    return totalCalories
  } catch (error) {
    console.log(error)
  }
}

module.exports = { calculateRecipeCalories }
