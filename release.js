const { exec } = require('node:child_process')
require('dotenv').config()

try {
  // Run node app.js to create user table and sample data
  exec('node index.js')

  // Run main.sql to initialize other tables
  // execSync('psql -U your_username -f models/main.sql')
  // execSync(`PGPASSWORD=${dbPassword} psql $DATABASE_URL -f models/main.sql`)
  // execSync(`psql ${databaseURL} -U your_username -h your_host -p your_port -d your_database_name -w -f models/main.sql`)
  // execSync(`psql ${process.env.DATABASE_URI} -f models/main.sql`)
  exec(`psql -U ${process.env.DB_USER} -h ${process.env.DB_HOST} -p ${process.env.DB_PORT} -d ${process.env.DB_NAME} -w ${process.env.DB_PASSWORD} -f models/main.sql`)

  console.log('Release.js runs successfully.')
} catch (error) {
  console.error('Release script failed:', error)
}
