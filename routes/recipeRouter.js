const recipeCtrl = require('../controllers/recipeCtrl')
const user_auth = require('../middleware/user_auth')
const {
  getAuthUrl,
  getAccessToken,
  getNewAccessToken,
  googleCallBack
} = require('../controllers/google_auth')
const { upload, storage } = require('../services/multerHandleImg')

const recipeRouter = require('express').Router()

//Create new recipe
recipeRouter.post('/', recipeCtrl.createRecipe)

//Get recipe by id
recipeRouter.get('/:recipe_id', recipeCtrl.get)

//Get recipe by name
recipeRouter.get('/name/:word', recipeCtrl.getByName)

//Get all recipe
recipeRouter.get('/', recipeCtrl.getAll)

//Get recipe by user
recipeRouter.get('/user/:author_id', recipeCtrl.getByUser)

//Update recipe
recipeRouter.put('/:recipe_id', user_auth, recipeCtrl.updateRecipe)

//Delete recipe
recipeRouter.delete('/:recipe_id', user_auth, recipeCtrl.deleteRecipe)

//Available ingredients
recipeRouter.post('/search-by-ingredients', recipeCtrl.getByIngredients)

//Get recipe base on user dietary
recipeRouter.get(
  '/recommendations/dietary/:userId',
  recipeCtrl.recipeRecBasedUserDietary
)
recipeRouter.get(
  '/recommendations/country/:userId',
  recipeCtrl.recipeRecBasedUserCountry
)

//Get recipe by country
recipeRouter.get('/by-country/:countryPrefId', recipeCtrl.getRecipeByCountry)

//Get recipe by dietary
recipeRouter.get('/by-dietary/:dietaryPref', recipeCtrl.getRecipeByDietary)

//Get recipe 
recipeRouter.post('/search-all', recipeCtrl.searchRecipes)

/* Recipe Ingredient */
recipeRouter.post('/insert-ingredient', recipeCtrl.insertIngredient)
recipeRouter.delete(
  '/delete-ingredient/:recipeId/:ingredientId',
  recipeCtrl.deleteIngredient
)
/* Country of Recipe */
recipeRouter.post('/insert-country', recipeCtrl.insertCountry)

recipeRouter.patch('/update-dietary/:recipeId', recipeCtrl.updateDietary)

recipeRouter.get('/get-origin/:recipeId', recipeCtrl.getOriginOfRecipe)

//Get dietary of Recipe
recipeRouter.get('/get-dietary/:recipeId', recipeCtrl.getDietaryOfRecipe)

// Calculate Recipe's Calories based on the Ingredients in recipe.
recipeRouter.get(
  '/calories/per_serving/:recipeId',
  recipeCtrl.getTotalIngCaloPerRecipe
)
// Calculate Recipe's Calories based on the ServingInput got from User
recipeRouter.post(
  '/calories/based_servings/:recipeId',
  recipeCtrl.getTotalCaloriesBasedServ
)

recipeRouter.post(
  '/get-ingredients-by-recipe/:recipeId',
  recipeCtrl.getIngredientsOfRecipe
)

recipeRouter.post(
  '/nutritions/total-ing-nutrition-facts/:recipeId',
  recipeCtrl.getTotalNutrtionFactOfRecipeIng
)

recipeRouter.post(
  '/nutritions/total-nutrition-facts/:recipeId',
  recipeCtrl.getTotalNutrtionFactOfRecipe
)

recipeRouter.post(
  '/update-img/:recipeId',
  upload.single('recipeImage'),
  user_auth, recipeCtrl.saveRecipeImg
)

recipeRouter.get('/get-img/:recipeId', recipeCtrl.getRecipeImg)

module.exports = recipeRouter
