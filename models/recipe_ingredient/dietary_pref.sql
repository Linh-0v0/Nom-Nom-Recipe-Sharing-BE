CREATE TABLE IF NOT EXISTS dietary_pref (name varchar PRIMARY KEY);

INSERT INTO
  dietary_pref (name)
VALUES
  ('Omnivorous'),
  ('Vegetarian'),
  ('Vegan'),
  ('Pescatarian'),
  ('Flexitarian'),
  ('Paleo'),
  ('Keto'),
  ('Mediterranean'),
  ('Gluten-free'),
  ('Dairy-free'),
  ('Low-carb'),
  ('Low-fat'),
  ('High-protein'),
  ('Raw food'),
  ('Fruitarian')
  ON CONFLICT DO NOTHING;