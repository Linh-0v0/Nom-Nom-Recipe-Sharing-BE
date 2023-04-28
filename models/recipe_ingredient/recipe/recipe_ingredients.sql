CREATE TABLE IF NOT EXISTS recipe_ingredients (
  PRIMARY KEY (recipe_id, ingredient_id),
  recipe_id INTEGER REFERENCES recipe(recipe_id) ON DELETE CASCADE,
  ingredient_id INTEGER,
  FOREIGN KEY (ingredient_id) REFERENCES ingredients(id) ON DELETE CASCADE,
  quantity DECIMAL(10, 2),
  unit_name varchar(30) NOT NULL REFERENCES units(unit_name) ON DELETE RESTRICT
);
-- `The ON DELETE CASCADE` clause specifies that when a record is deleted from the `recipes` or `ingredients` table, all corresponding records in the `recipe_ingredients` table should also be deleted.

-- -- CREATE SEQUENCE 
-- CREATE SEQUENCE recipe_ingredients_seq START WITH 1 INCREMENT BY 1 NO CYCLE;

-- --ensure that the ingredient_id column of the recipe_ingredients table is always incremented automatically with a unique value
-- ALTER TABLE recipe_ingredients ALTER COLUMN ingredient_id SET DEFAULT nextval('recipe_ingredients_seq');

INSERT INTO
  recipe_ingredients (recipe_id, ingredient_id, quantity, unit_name)
VALUES
  (1, 1, 500, 'grams'),
  (1, 2, 100, 'grams'),
  (1, 3, 200, 'grams'),
  (1, 4, 100, 'grams'),
  (2, 2, 2, 'cups'),
  (2, 5, 1, 'pounds'),
  (2, 6, 2, 'teaspoons'),
  (3, 1, 300, 'grams'),
  (3, 7, 1, 'cups'),
  (3, 8, 1, 'teaspoons'),
  (3, 9, 2, 'tablespoons'),
  (4, 3, 3, 'tablespoons'),
  (4, 4, 2, 'teaspoons'),
  (4, 5, 1, 'pounds'),
  (5, 2, 2, 'cups') ON CONFLICT DO NOTHING;