CREATE TABLE IF NOT EXISTS reviews (
  review_id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  rating INTEGER NOT NULL,
  comment TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reviews_recipes (
  review_id INTEGER REFERENCES reviews(review_id),
  recipe_id INTEGER REFERENCES recipe(recipe_id),
  PRIMARY KEY (review_id, recipe_id)
);
