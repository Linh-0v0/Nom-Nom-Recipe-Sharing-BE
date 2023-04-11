const Ingredient = require('../controllers/ingredientCtrl')

//'router': used to define routes for our application.
//.Router(): telling app to use expressJS to req,res http
const router = require('express').Router()

router.get('/ingredient/create', Ingredient.insert)
router.get('/ingredient/get/:ingredientId', Ingredient.get)
router.get('/ingredient/get-all', Ingredient.getAll)
router.get('/ingredient/update/:ingredientId', Ingredient.update)
router.get('/ingredient/delete/:ingredientId', Ingredient.delete)

module.exports = router
