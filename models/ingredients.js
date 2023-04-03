const { Pool } = require('pg');
const fs = require('fs');
const csv = require('csv-parser');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'nom_nom',
  password: 'postgres',
  port: 5432,
});

const batchSize = 10000;
let rowCount = 0;

const createIngredientsTableQuery = `
  CREATE TABLE IF NOT EXISTS ingredients (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    quantity INT,
    cal DECIMAL(10,2),
    fat DECIMAL(10,2),
    cholesterol DECIMAL(10,2),
    sodium DECIMAL(10,2),
    protein DECIMAL(10,2),
    carb DECIMAL(10,2),
    fiber DECIMAL(10,2),
    sugars DECIMAL(10,2),
    vitamin VARCHAR(50)
  );
`;
pool.query(createIngredientsTableQuery, (err, res) => {
  if (err) {
    console.error('Error creating ingredients table', err.stack);
    pool.end();
    return;
  }
  console.log('Ingredients table created');
  
  // Read and insert data from CSV file
  const insertIngredientsQuery = `
    INSERT INTO ingredients (name, quantity, cal, fat, cholesterol, sodium, protein, carb, fiber, sugars, vitamin)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    ON CONFLICT DO NOTHING;
  `;

  const batchSize = 10000;
  let rowCount = 0;
  let batch = [];

  fs.createReadStream('./csv/igd.csv')
    .pipe(csv())
    .on('data', (data) => {
      const row = [
        data.name,
        parseInt(data.quantity),
        parseFloat(data.cal),
        parseFloat(data.fat),
        parseFloat(data.cholesterol),
        parseFloat(data.sodium),
        parseFloat(data.protein),
        parseFloat(data.carb),
        parseFloat(data.fiber),
        parseFloat(data.sugars),
        data.vitamin
      ];
      batch.push(row);
      rowCount++;
      if (batch.length === batchSize) {
        insertIngredientsBatch(batch);
        batch = [];
      }
    })
    .on('end', () => {
      if (batch.length > 0) {
        insertIngredientsBatch(batch);
      }
      console.log(`Finished inserting ${rowCount} rows into the ingredients table`);
      pool.end();
    });

  function insertIngredientsBatch(batch) {
    pool.query(insertIngredientsQuery, batch, (err, res) => {
      if (err) {
        console.error('Error inserting ingredients batch', err.stack);
      }
    });
  }
});
