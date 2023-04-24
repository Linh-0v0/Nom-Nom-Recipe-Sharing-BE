CREATE TABLE IF NOT EXISTS recipe_dietary (
  recipe_id INTEGER REFERENCES recipe(recipe_id) ON DELETE CASCADE,
  dietary_pref varchar REFERENCES dietary_pref(name) ON DELETE CASCADE,
  PRIMARY KEY (recipe_id, dietary_pref)
);

INSERT INTO
  recipe_dietary (recipe_id, dietary_pref)
VALUES
  (1, 'Vegetarian'),
  (1, 'Gluten-free'),
  (1, 'Dairy-free'),
  (2, 'Vegetarian'),
  (2, 'Vegan'),
  (2, 'Gluten-free'),
  (3, 'Vegetarian'),
  (3, 'Vegan'),
  (3, 'Gluten-free'),
  (4, 'Paleo'),
  (4, 'Gluten-free'),
  (5, 'Vegetarian'),
  (5, 'Vegan'),
  (5, 'Gluten-free'),
  (6, 'Vegan'),
  (6, 'Gluten-free'),
  (7, 'Keto'),
  (8, 'Paleo'),
  (8, 'Gluten-free') ON CONFLICT DO NOTHING;