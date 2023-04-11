--FOREIGN KEY (user_id) REFERENCES users(user_id),
 CREATE TABLE collection (
  collection_id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  recipe_id INT NOT NULL,
  note TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (recipe_id) REFERENCES recipe(recipe_id)
);

