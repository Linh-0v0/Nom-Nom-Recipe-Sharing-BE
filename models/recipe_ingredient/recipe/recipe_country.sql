CREATE TABLE IF NOT EXISTS recipe_dietary (
  recipe_id INTEGER REFERENCES recipe(recipe_id) ON DELETE CASCADE,
  country_pref_id INTEGER REFERENCES countries(id) ON DELETE CASCADE,
  PRIMARY KEY (recipe_id, country_pref_id)
);