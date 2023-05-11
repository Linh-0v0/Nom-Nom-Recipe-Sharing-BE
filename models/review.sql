CREATE TABLE IF NOT EXISTS reviews (
  review_id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  rating INTEGER NOT NULL,
  comment TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO reviews (review_id, user_id, rating, comment)
VALUES
  (1, 1, 5, 'Great recipe!'),
  (2, 2, 4, 'Delicious dish.'),
  (3, 1, 3, 'Needs more seasoning.'),
  (4, 1, 1, 'Disappointing.'),
  (5, 2, 5, 'Best recipe ever!'),
  (6, 2, 4, 'Tasty and easy to make.') ON CONFLICT DO NOTHING;


CREATE TABLE IF NOT EXISTS reviews_recipes (
  review_id INTEGER REFERENCES reviews(review_id),
  recipe_id INTEGER REFERENCES recipe(recipe_id),
  PRIMARY KEY (review_id, recipe_id)
);

INSERT INTO reviews_recipes (review_id, recipe_id)
VALUES
  (1, 1),
  (2, 1),
  (3, 2),
  (4, 3),
  (5, 3),
  (6, 2) ON CONFLICT DO NOTHING;
