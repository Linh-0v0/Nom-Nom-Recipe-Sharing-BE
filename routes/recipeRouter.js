const recipeCtrl = require('../controllers/recipeCtrl')
const user_auth = require('../middleware/user_auth')

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

//Get recipe base on user dietary
recipeRouter.get(
  '/recommendations/dietary/:userId',
  recipeCtrl.recipeRecBasedUserDietary
)

recipeRouter.get(
  '/recommendations/country/:userId',
  recipeCtrl.recipeRecBasedUserCountry
)

recipeRouter.post(
  '/insert-ingredient', recipeCtrl.insertIngredient
)


module.exports = recipeRouter
