CREATE TABLE IF NOT EXISTS dietary_pref (name varchar PRIMARY KEY);

INSERT INTO
  dietary_pref (name)
VALUES
  ('Vegetarian'),
  ('Vegan'),
  ('Keto'),
  ('Paleo'),
  ('Gluten-free'),
  ('Dairy-free')
  ON CONFLICT DO NOTHING;