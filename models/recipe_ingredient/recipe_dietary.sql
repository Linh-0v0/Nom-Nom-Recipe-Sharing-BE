CREATE TABLE IF NOT EXISTS recipe_dietary (
  recipe_id INTEGER REFERENCES recipes(id) ON DELETE CASCADE,
  dietary_pref INTEGER REFERENCES dietary_pref(name) ON DELETE CASCADE,
  PRIMARY KEY (recipe_id, tag_id)
);