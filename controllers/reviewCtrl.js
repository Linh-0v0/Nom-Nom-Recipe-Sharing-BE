const db = require('../db')
const user_auth = require('../middleware/user_auth')

const reviewCtrl = {}

//Create new review including rating and comment. Comment can be null
reviewCtrl.createReview = async (req, res) => {
  const userId = req.user && req.user.id
  const recipeId = req.params.recipe_id
  const { rating, comment } = req.body

  try {
    const client = await db.connect()
    await client.query('BEGIN')

    // Insert into review table
    const insertReviewQuery =
      'INSERT INTO reviews (user_id, rating, comment) VALUES ($1, $2, $3) RETURNING review_id'
    const insertReviewValues = [userId, rating, comment]
    const { review_id } = await client
      .query(insertReviewQuery, insertReviewValues)
      .then(result => result[0])
    console.log(`Review with ID ${review_id} inserted into review table`)

    // Insert into review_recipe table
    const insertReviewRecipeQuery =
      'INSERT INTO reviews_recipes (review_id, recipe_id) VALUES ($1, $2)'
    const insertReviewRecipeValues = [review_id, recipeId]
    await client.query(insertReviewRecipeQuery, insertReviewRecipeValues)
    console.log(
      `Review with ID ${review_id} linked to recipe with ID ${recipeId}`
    )

    await client.query('COMMIT')

    res.status(200).json({ message: 'Review created' })
  } catch (error) {
    console.error('Error creating review:', error)
    res.status(500).json({ message: 'Error creating review' })
  }
}

//Get one review by recipe id
reviewCtrl.getReview = async (req, res) => {
  const { recipe_id, review_id } = req.params

  try {
    const review = await db.oneOrNone(
      `
        SELECT *
        FROM reviews
        INNER JOIN reviews_recipes ON reviews.review_id = reviews_recipes.review_id
        WHERE reviews_recipes.recipe_id = $1 AND reviews.review_id = $2
      `,
      [recipe_id, review_id]
    )
    if (review) {
      res.status(200).json(review)
    } else {
      res.status(404).json({ message: 'Review not found' })
    }
  } catch (error) {
    console.error('Error retrieving review:', error)
    res.status(500).json({ message: 'Error retrieving review' })
  }
}

//Get all review in 1 recipe
reviewCtrl.getRecipeReviews = async (req, res) => {
  const recipeId = req.params.recipe_id

  try {
    const reviews = await db.any(
      `
        SELECT r.review_id, r.rating, r.comment, r.created_at, r.updated_at, u.username
        FROM reviews r
        JOIN reviews_recipes rr ON rr.review_id = r.review_id
        JOIN users u ON u.id = r.user_id
        WHERE rr.recipe_id = $1
      `,
      [recipeId]
    )

    res.status(200).json(reviews)
  } catch (error) {
    console.error('Error retrieving reviews for recipe:', error)
    res.status(500).json({ message: 'Error retrieving reviews for recipe' })
  }
}

//Update review by user log in
reviewCtrl.updateReview = async (req, res) => {
  const { rating, comment } = req.body
  const { review_id } = req.params
  const user_id = req.user && req.user.id

  try {
    // Get the review and check if the authenticated user owns it
    const review = await db.oneOrNone(
      'SELECT * FROM reviews WHERE review_id = $1 AND user_id = $2',
      [review_id, user_id]
    )
    if (!review) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    // Update the review
    const updateReviewQuery =
      'UPDATE reviews SET rating = $1, comment = $2, updated_at = NOW() WHERE review_id = $3'
    const updateReviewValues = [rating, comment, review_id]
    await db.none(updateReviewQuery, updateReviewValues)

    res.status(200).json({ message: 'Review updated' })
  } catch (error) {
    console.error('Error updating review:', error)
    res.status(500).json({ message: 'Error updating review' })
  }
}

//Delete review by user log in
reviewCtrl.deleteReview = async (req, res) => {
  const reviewId = req.params.review_id
  const userId = req.user && req.user.id

  try {
    // Check if review exists and belongs to the authenticated user
    const review = await db.oneOrNone(
      'SELECT * FROM reviews WHERE review_id = $1 AND user_id = $2',
      [reviewId, userId]
    )

    if (!review) {
      return res
        .status(404)
        .json({ message: 'Review not found or unauthorized' })
    }

    // Delete review from both review and review_recipe tables
    await db.tx(async t => {
      await t.none('DELETE FROM reviews_recipes WHERE review_id = $1', [
        reviewId
      ])
      await t.none('DELETE FROM reviews WHERE review_id = $1', [reviewId])
    })

    res.status(200).json({ message: 'Review deleted' })
  } catch (error) {
    console.error('Error deleting review:', error)
    res.status(500).json({ message: 'Error deleting review' })
  }
}

//Get recipe with all review
reviewCtrl.getRecipeWithReviews = async (req, res) => {
  const recipe_id = req.params.recipe_id

  try {
    const recipe = await db.one(
      `
        SELECT *
        FROM recipe
        WHERE recipe_id = $1
      `,
      [recipe_id]
    )

    const reviews = await db.any(
      `
        SELECT r.*, u.username
        FROM reviews r
        JOIN users u ON r.user_id = u.id
        JOIN reviews_recipes rr ON r.review_id = rr.review_id
        WHERE rr.recipe_id = $1
      `,
      [recipe_id]
    )

    res.status(200).json({
      recipe,
      reviews
    })
  } catch (error) {
    console.error('Error retrieving recipe with reviews:', error)
    res.status(500).json({ message: 'Error retrieving recipe with reviews' })
  }
}

module.exports = reviewCtrl
