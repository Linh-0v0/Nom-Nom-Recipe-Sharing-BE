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
  vitamin_a DECIMAL(10,2) NULL,
  vitamin_b12 DECIMAL(10,2) NULL,
  vitamin_b6 DECIMAL(10,2) NULL,
  vitamin_c DECIMAL(10,2) NULL,
  vitamin_d DECIMAL(10,2) NULL,
  vitamin_e DECIMAL(10,2) NULL,
  vitamin_k DECIMAL(10,2) NULL
);

-- Insert sample ingredients
INSERT INTO ingredients (
  ing_name, 
  quantity, 
  unit_name, 
  calories, 
  carb, 
  protein, 
  fat, 
  sugar, 
  sodium, 
  fiber, 
  cholesterol, 
  vitamin_a, 
  vitamin_b12, 
  vitamin_b6, 
  vitamin_c, 
  vitamin_d, 
  vitamin_e, 
  vitamin_k
) VALUES 
  ('Chicken Breast', 100, 'grams', 165, 0, 31, 3.6, 0, 64, 0, 88, 1, 0.12, 0.53, 0, 0, 0.04, 0),
  ('Salmon', 100, 'grams', 206, 0, 20, 13, 0, 59, 0, 55, 9, 4.79, 0.67, 0, 0, 2.38, 0),
  ('Egg', 50, 'grams', 72, 0.36, 6.3, 4.8, 0.36, 71, 0, 186, 80, 0.89, 0.09, 0, 2.83, 0.49, 0.15),
  ('Quinoa', 50, 'grams', 56, 10.5, 2.4, 0.9, 0.87, 7, 1.5, 0, 0, 0, 0.06, 0, 0, 0.31, 0.3),
  ('Sweet Potato', 100, 'grams', 86, 20.1, 1.6, 0.1, 4.2, 55, 3, 0, 19218, 0, 0.17, 2.4, 0, 0.26, 1.8),
  ('Spinach', 50, 'grams', 7, 0.86, 0.86, 0.13, 0.43, 79, 0.7, 0, 469, 0, 0.065, 28.1, 0, 2.03, 144),
  ('Tomato', 100, 'grams', 18, 3.9, 0.9, 0.2, 2.6, 5, 1.2, 0, 833, 0, 0.06, 14, 0, 0.54, 0.8),
  ('Avocado', 50, 'grams', 80, 4, 1, 7, 0.2, 0, 3, 0, 7, 0, 0.11, 3.2, 0, 1.32, 7)
  ON CONFLICT DO NOTHING;