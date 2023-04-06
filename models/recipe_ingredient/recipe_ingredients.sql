CREATE TABLE IF NOT EXISTS recipe_ingredient (
  id SERIAL PRIMARY KEY,
  recipe_id INTEGER REFERENCES recipes(id) ON DELETE CASCADE,
  ingredient_id INTEGER REFERENCES ingredients(id) ON DELETE CASCADE,
  quantity DECIMAL(10,2),
  unit_name varchar(30) NOT NULL REFERENCES units(unit_name) ON DELETE RESTRICT,
  FOREIGN KEY (ingredient_id) REFERENCES ingredients(id)
);
-- `The ON DELETE CASCADE` clause specifies that when a record is deleted from the `recipes` or `ingredients` table, all corresponding records in the `recipe_ingredients` table should also be deleted.

-- Insert sample recipe ingredients
INSERT INTO recipe_ingredient (recipe_id, ingredient_id, quantity, unit_name)
VALUES (1, 1, 400, 'grams'),
       (1, 2, 50, 'grams'),
       (1, 3, 2, 'teaspoons'),
       (1, 4, 200, 'milliliters'),
       (2, 1, 250, 'grams'),
       (2, 2, 100, 'grams'),
       (2, 3, 1, 'teaspoons'),
       (2, 4, 100, 'milliliters')
ON CONFLICT DO NOTHING;