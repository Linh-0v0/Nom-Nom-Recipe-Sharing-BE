CREATE TABLE IF NOT EXISTS recipe_country (
  recipe_id INTEGER REFERENCES recipe(recipe_id) ON DELETE CASCADE,
  country_pref_id INTEGER REFERENCES countries(id) ON DELETE CASCADE,
  PRIMARY KEY (recipe_id, country_pref_id)
);

INSERT INTO
  recipe_country (recipe_id, country_pref_id)
VALUES
  (1, 100),
  (1, 123),
  (1, 34),
  (2, 3),
  (2, 67),
  (2, 7),
  (2, 3),
  (3, 1),
  (3, 76),
  (3, 8),
  (4, 1),
  (4, 5),
  (4, 3)
  ON CONFLICT DO NOTHING;