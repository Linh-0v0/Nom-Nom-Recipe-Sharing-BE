const db = require('../db') // Import your database connection
const { convertUnitToReturnQuantity } = require('./unit-converter') // Import the function to convert ingredient quantities to calories

async function calculateRecipeCalories(recipeId) {
  try {
    // Retrieve all the ingredients of the recipe with their quantities and unit names
    const ingredients = await db.any(
      'SELECT i.id, i.calories, ri.quantity, ri.unit_name FROM ingredients i JOIN recipe_ingredient ri ON i.id = ri.ingredient_id WHERE ri.recipe_id = $1',
      [recipeId]
    )

    let totalCalories = 0
    // Calculate the total calories of the recipe based on its ingredients
    for (const ingredient of ingredients) {
      const ingredientCalories = ingredient.calories
      const quantityInGrams = convertUnitToReturnQuantity(
        ingredient.quantity,
        ingredient.unit_name,
        'g'
      )
      const ingredientTotalCalories =
        (quantityInGrams / 100) * ingredientCalories
      totalCalories += ingredientTotalCalories
    }
    return totalCalories
  } catch (error) {
    console.log(error)
  }
}

module.exports = { calculateRecipeCalories }
