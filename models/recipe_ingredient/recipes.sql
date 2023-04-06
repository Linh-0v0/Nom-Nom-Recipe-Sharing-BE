CREATE TABLE recipes (
  id SERIAL PRIMARY KEY,
  recipe_name VARCHAR(50) NOT NULL
);

-- Insert sample recipes
INSERT INTO recipes (recipe_name)
VALUES ('Bread'),
       ('Cake')
ON CONFLICT DO NOTHING;