const Ingredient = require('../controllers/ingredientCtrl')

//'router': used to define routes for our application.
//.Router(): telling app to use expressJS to req,res http
const router = require('express').Router()

router.post('/create', Ingredient.insert)
router.get('/get/:ingredientId', Ingredient.get)
router.get('/get-all', Ingredient.getAll)
router.patch('/update/:ingredientId', Ingredient.update)
router.delete('/delete/:ingredientId', Ingredient.delete)

module.exports = router
