CREATE TABLE IF NOT EXISTS recipe_country (
  recipe_id INTEGER REFERENCES recipe(recipe_id) ON DELETE CASCADE,
  country_pref_id INTEGER REFERENCES countries(id) ON DELETE CASCADE,
  PRIMARY KEY (recipe_id, country_pref_id)
);

INSERT INTO
  recipe_country (recipe_id, country_pref_id)
VALUES
  (1, 100),
  (1, 200),
  (1, 300),
  (2, 3),
  (2, 500),
  (2, 7),
  (2, 3),
  (3, 1),
  (3, 900),
  (3, 1000),
  (4, 1),
  (4, 200),
  (4, 3)
  ON CONFLICT DO NOTHING;