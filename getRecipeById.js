const db = require('../database')
const { calculateRecipeCalories } = require('../utils/recipe-calculator')

async function getRecipeById(req, res) {
  const { id } = req.params
  try {
    // Retrieve the recipe details from the database
    const recipe = await db.one('SELECT * FROM recipes WHERE id = $1', id)
    // Calculate the total calories of the recipe
    const totalCalories = await calculateRecipeCalories(id)
    // Combine the recipe details and total calories in a single object and send it as the response
    const response = { ...recipe, total_calories: totalCalories }
    res.json(response)
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: 'Error retrieving recipe' })
  }
}

module.exports = { getRecipeById }
