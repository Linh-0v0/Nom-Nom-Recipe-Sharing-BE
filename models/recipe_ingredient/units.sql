CREATE TABLE IF NOT EXISTS units (
    unit_name varchar(30) PRIMARY KEY,
    abbreviation VARCHAR(10)
)

-- Insert sample data into units table
INSERT INTO units (unit_name, abbreviation)
VALUES 
  ('grams', 'g'),
  ('kilograms', 'kg'),
  ('milliliters', 'ml'),
  ('liters', 'l'),
  ('teaspoons', 'tsp'),
  ('tablespoons', 'tbsp'),
  ('cups', 'c'),
  ('ounces', 'oz'),
  ('pounds', 'lb');
ON CONFLICT DO NOTHING;