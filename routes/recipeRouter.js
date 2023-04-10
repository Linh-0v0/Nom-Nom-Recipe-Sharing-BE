const express = require('express')
const recipeCtrl = require('../controllers/recipeCtrl')

const recipeRouter = express.Router()

//Get recipe by references
recipeRouter.get('/', recipeCtrl.getAll)
recipeRouter.get('/:recipe_id', recipeCtrl.get)
recipeRouter.get('/name/:word', recipeCtrl.getByName)
recipeRouter.get('/origin/:word', recipeCtrl.getByOrigin)
recipeRouter.get('/diet/:word', recipeCtrl.getByDiet)
recipeRouter.get('/user/:author_id', recipeCtrl.getByUser)


recipeRouter.post('/', recipeCtrl.insert)

recipeRouter.put('/:recipe_id', recipeCtrl.update)
recipeRouter.delete('/:recipe_id', recipeCtrl.delete)

module.exports = recipeRouter
