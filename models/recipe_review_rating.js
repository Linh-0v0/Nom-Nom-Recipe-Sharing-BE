const { Pool } = require('pg')

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'nom_nom',
  password: 'postgres',
  port: 5432
})

const createTableQuery = `
CREATE TABLE IF NOT EXISTS recipe_review_rating (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES user(id),
    ingredient_id INT REFERENCES ingredients(id),
    rating INT,
    review TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`

pool.query(createTableQuery, (err, res) => {
  if (err) {
    console.error('Error creating table', err.stack)
    pool.end()
    return
  }

  console.log('Table created')
  pool.end()
})
