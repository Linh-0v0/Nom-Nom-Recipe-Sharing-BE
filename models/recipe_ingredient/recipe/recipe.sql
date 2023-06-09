CREATE TABLE IF NOT EXISTS recipe (
  recipe_id SERIAL PRIMARY KEY,
  author_id INT NOT NULL,
  FOREIGN KEY (author_id) REFERENCES users(id),
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  serving_size DECIMAL(10,2) NOT NULL,
  serving_unit VARCHAR(255) NOT NULL,
  duration INTERVAL,
  image_link VARCHAR(255),
  description TEXT NOT NULL
);

-- CREATE SEQUENCE 
-- CREATE SEQUENCE recipe_id_seq START WITH 1 INCREMENT BY 1 NO CYCLE;

-- INSERT INTO
INSERT INTO
  recipe (
    author_id,
    name,
    serving_size,
    serving_unit,
    duration,
    image_link,
    description
  )
VALUES
  (
    1,
    'Lentil Soup',
    6,
    'people',
    '1 hour',
    'https://example.com/lentil-soup.jpg',
    'A hearty and healthy soup made with lentils and vegetables.'
  ),
  (
    1,
    'Quinoa Salad',
    4,
    'serving',
    '30 minutes',
    'https://example.com/quinoa-salad.jpg',
    'A light and refreshing salad made with quinoa, cucumber, and tomato.'
  ),
  (
    2,
    'Vegan Curry',
    4,
    'serving',
    '45 minutes',
    'https://example.com/vegan-curry.jpg',
    'A flavorful and filling curry made with vegetables and coconut milk.'
  ),
  (
    2,
    'Paleo Burger',
    2,
    'serving',
    '30 minutes',
    'https://example.com/paleo-burger.jpg',
    'A satisfying burger made with a lettuce wrap instead of a bun.'
  ),
  (
    1,
    'Gluten-free Pizza',
    8,
    'serving',
    '1 hour',
    'https://example.com/gluten-free-pizza.jpg',
    'A delicious pizza made with a gluten-free crust and your favorite toppings.'
  ),
  (
    2,
    'Dairy-free Mac and Cheese',
    4,
    'serving',
    '45 minutes',
    'https://example.com/dairy-free-mac-and-cheese.jpg',
    'A creamy and indulgent mac and cheese made without dairy.'
  ),
  (
    1,
    'Keto Brownies',
    12,
    'serving',
    '45 minutes',
    'https://example.com/keto-brownies.jpg',
    'A rich and chocolatey brownie recipe that fits within a keto diet.'
  ),
  (
    2,
    'Paleo Banana Bread',
    1,
    'loaf',
    '1 hour',
    'https://example.com/paleo-banana-bread.jpg',
    'A moist and delicious banana bread made with paleo-friendly ingredients.'
  ) ON CONFLICT DO NOTHING;

-- -- START FROM ID 9
-- ALTER SEQUENCE recipe_id_seq RESTART WITH 9;