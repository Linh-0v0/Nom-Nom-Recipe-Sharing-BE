const { execSync } = require('child_process')
require('dotenv').config()

try {
  // Run node app.js to create user table and sample data
  execSync('node index.js')

  // Run main.sql to initialize other tables
  // execSync('psql -U your_username -f models/main.sql')
  // execSync(`PGPASSWORD=${dbPassword} psql $DATABASE_URL -f models/main.sql`)
  // execSync(`psql ${databaseURL} -U your_username -h your_host -p your_port -d your_database_name -w -f models/main.sql`)
  execSync(`psql ${process.env.DATABASE_URI} -f models/main.sql`)
} catch (error) {
  console.error('Release script failed:', error)
  process.exit(1)
}
