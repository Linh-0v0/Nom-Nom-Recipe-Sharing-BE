const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'nom_nom',
  password: 'postgres',
  port: 5432,
});

const createTableQuery = `
CREATE TABLE IF NOT EXISTS recipe (
    recipe_id SERIAL PRIMARY KEY,
    ingredient_id INT REFERENCES ingredients(id),
    author INT REFERENCES user(id),
    name VARCHAR(255) NOT NULL,
    cal DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    duration INTERVAL,
    image_link VARCHAR(255),
    origin VARCHAR(255),
    diet_type VARCHAR(255),
    description TEXT
  );
`;

pool.query(createTableQuery, (err, res) => {
  if (err) {
    console.error('Error creating table', err.stack);
    pool.end();
    return;
  }

  console.log('Table created');
  pool.end();
});
