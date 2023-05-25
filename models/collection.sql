CREATE TABLE IF NOT EXISTS collection (
  collection_id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id),
  name VARCHAR(100) NOT NULL,
  note TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  image_link VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS collection_recipe (
  collection_id INT NOT NULL,
  recipe_id INT NOT NULL,
  PRIMARY KEY (collection_id, recipe_id),
  FOREIGN KEY (collection_id) REFERENCES collection(collection_id),
  FOREIGN KEY (recipe_id) REFERENCES recipe(recipe_id)
);

INSERT INTO collection (collection_id, user_id, name, note)
VALUES
  (1, 1, 'Favorites', 'Collection of my favorite recipes'),
  (2, 1, 'Quick and Easy', 'Collection of quick and easy recipes'),
  (3, 2, 'Desserts', 'Collection of delicious desserts') on CONFLICT DO NOTHING;

INSERT INTO collection_recipe (collection_id, recipe_id)
VALUES
  (1, 1),
  (1, 2),
  (2, 3),
  (2, 4),
  (3, 5)
ON CONFLICT DO NOTHING;
