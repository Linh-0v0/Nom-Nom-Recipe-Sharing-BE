const express = require('express')
const reviewCtrl = require('../controllers/reviewCtrl')
const reviewRouter = express.Router()
const user_auth = require('../middleware/user_auth')

//Create new recipe
reviewRouter.post('/:recipe_id/reviews', user_auth, reviewCtrl.createReview)

//Get one review by recipe ID
reviewRouter.get(
  '/:recipe_id/reviews/:review_id',
  user_auth,
  reviewCtrl.getReview
)

//Update review by auth user
reviewRouter.put(
  '/:recipe_id/reviews/:review_id',
  user_auth,
  reviewCtrl.updateReview
)

//Get all review in 1 recipe
reviewRouter.get('/:recipe_id/reviews', reviewCtrl.getRecipeReviews)

//Delete review
reviewRouter.delete(
  '/:recipe_id/reviews/:review_id',
  user_auth,
  reviewCtrl.deleteReview
)

//Get recipe with all reviews
reviewRouter.get(
  '/rr/:recipe_id/reviews',
  reviewCtrl.getRecipeWithReviews
)

module.exports = reviewRouter
