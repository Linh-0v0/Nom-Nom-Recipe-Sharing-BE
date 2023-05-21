const { exec } = require('node:child_process')
const path = require('path');
const mainSqlPath = path.join(__dirname, 'models', 'main.sql');
require('dotenv').config()

try {
  // Run node app.js to create user table and sample data
  exec('node index.js')

  // Run main.sql to initialize other tables
  // execSync(`psql ${process.env.DATABASE_URI} -f models/main.sql`)
  exec(
    `psql -U ${process.env.DB_USER} -h ${process.env.DB_HOST} -p ${process.env.DB_PORT} -d ${process.env.DB_NAME} -w ${process.env.DB_PASSWORD} -f ${mainSqlPath}`
  )

  console.log('Release.js runs successfully.')
} catch (error) {
  console.error('Release script failed:', error)
}
