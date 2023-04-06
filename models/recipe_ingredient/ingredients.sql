CREATE TABLE IF NOT EXISTS ingredients (
  id SERIAL PRIMARY KEY,
  ing_name VARCHAR(255) NOT NULL,
  quantity DECIMAL(10,2) NOT NULL,
  unit_name varchar(30) NOT NULL REFERENCES units(unit_name) ON DELETE RESTRICT,
  calories DECIMAL(10,2) NOT NULL,
  carb DECIMAL(10,2) NULL,
  protein DECIMAL(10,2) NULL,
  fat DECIMAL(10,2) NULL,
  sugar DECIMAL(10,2) NULL,
  sodium DECIMAL(10,2) NULL,
  fiber DECIMAL(10,2) NULL,
  cholesterol DECIMAL(10,2) NULL,
  mineral VARCHAR(255) NULL,
  vitamin_a DECIMAL(10,2) NULL,
  vitamin_b12 DECIMAL(10,2) NULL,
  vitamin_b6 DECIMAL(10,2) NULL,
  vitamin_c DECIMAL(10,2) NULL,
  vitamin_d DECIMAL(10,2) NULL,
  vitamin_e DECIMAL(10,2) NULL,
  vitamin_k DECIMAL(10,2) NULL
);

-- Insert sample ingredients
INSERT INTO ingredients (ing_name, quantity, unit_name, calories)
VALUES ('Flour', 500, 'grams', 1500),
       ('Sugar', 100, 'grams', 400),
       ('Salt', 5, 'grams', 0),
       ('Water', 250, 'milliliters', 0)
ON CONFLICT DO NOTHING;