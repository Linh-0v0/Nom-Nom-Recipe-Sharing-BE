-- CREATE TABLE recipes (
--   id SERIAL PRIMARY KEY,
--   recipe_name VARCHAR(50) NOT NULL
-- );

-- -- Insert sample recipes
-- INSERT INTO recipes (recipe_name)
-- VALUES ('Bread'),
--        ('Cake')
-- ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS recipe  (
  recipe_id SERIAL PRIMARY KEY,
  author_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  serving_size VARCHAR(255),
  duration INTERVAL, 
  image_link VARCHAR(255),
  origin VARCHAR(255),
  diet_type VARCHAR(255),
  description TEXT NOT NULL
)

--   FOREIGN KEY (author_id) REFERENCES users(id)

