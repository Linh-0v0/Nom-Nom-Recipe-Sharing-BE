CREATE TABLE IF NOT EXISTS collection (
  collection_id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id),
  name VARCHAR(100) NOT NULL,
  note TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS collection_recipe (
  collection_id INT NOT NULL,
  recipe_id INT NOT NULL,
  PRIMARY KEY (collection_id, recipe_id),
  FOREIGN KEY (collection_id) REFERENCES collection(collection_id),
  FOREIGN KEY (recipe_id) REFERENCES recipe(recipe_id)
)
