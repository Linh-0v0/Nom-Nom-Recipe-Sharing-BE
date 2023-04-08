const express = require('express');
const recipeCtrl = require('../controllers/recipeCtrl');

const recipeRouter = express.Router();


recipeRouter.get('/', recipeCtrl.getAll);
recipeRouter.get('/:recipe_id', recipeCtrl.get);
recipeRouter.get('/name/:word', recipeCtrl.getByName);

recipeRouter.post('/', recipeCtrl.insert);


recipeRouter.put('/:recipe_id', recipeCtrl.update);
recipeRouter.delete('/:recipe_id', recipeCtrl.delete);

module.exports = recipeRouter;
