const pgp = require('pg-promise')()
const path = require('path')
const fs = require('fs')
const bcrypt = require('bcrypt')

const db = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD
}

// const dbConnect = pgp(db)
const dbConnect = pgp({
  connectionString: process.env.DATABASE_URI,
  ssl: {
    rejectUnauthorized: false
  }
})

module.exports = dbConnect

/* -------------------------------------------------- */

// Function to execute SQL file using pg-promise
async function initializeAllTablesData() {
  try {
    const mainFilePath = path.join(__dirname, 'models', 'main.sql')

    // Define a regular expression pattern to match file paths after '\i' statements
    const pattern = /\\i\s+([^\n\r]+)/g

    const mainSqlContent = fs.readFileSync(mainFilePath, 'utf-8')

    // Extract the file paths from the SQL content
    const fileMatches = mainSqlContent.match(pattern)

    // Remove the '\i' from each file path
    const filePaths = fileMatches.map(match => match.replace('\\i', '').trim())

    for (const filePath of filePaths) {
      const filePathFromRoot = path.join(__dirname, filePath)
      const sql = fs.readFileSync(filePathFromRoot, 'utf-8')
      await dbConnect.none(sql)
    }

    console.log('All SQL statements executed successfully.')
    //
  } catch (err) {
    console.log(err)
  }
}

async function initializeUserSample() {
  try {
    const filePath = path.join(__dirname, 'models', 'user_mgm', 'users.sql')
    const sql = fs.readFileSync(filePath).toString()
    await dbConnect.none(sql)

    // Code after this will not execute until createTable has finished
  } catch (err) {
    console.error(err)
  }
}

async function uniqueEmailConstraint() {
  try {
    await dbConnect.none(`
    DO $$
    BEGIN
    IF NOT EXISTS (
      SELECT constraint_name FROM information_schema.constraint_column_usage
      WHERE table_name = 'users' AND column_name = 'email'
    ) THEN
      ALTER TABLE users ADD CONSTRAINT unique_email UNIQUE (email);
      
    END IF;
    END;
    $$;
  `)

    // Code after this will not execute until createTable has finished
  } catch (err) {
    console.error(err)
  }
}

async function addSampleUsers() {
  /* -------------------------------------------------- */
  /* INSERT USERS SAMPLE VALUES */
  // Hash the password using bcrypt
  const hashedPassword = password => {
    const hash = bcrypt.hash(password, 10)
    return hash
  }

  // Insert the user into the database using pg-promise
  const newUser1 = {
    username: 'mock1',
    email: 'mock1@gmail.com',
    password: await hashedPassword('1234567')
  }

  const newUser2 = {
    username: 'mock2',
    email: 'mock2@gmail.com',
    password: await hashedPassword('1234567')
  }
  dbConnect.none(
    'INSERT INTO users (username, email, password) VALUES (${username}, ${email}, ${password}) ON CONFLICT ON CONSTRAINT unique_email DO NOTHING',
    newUser1
  )
  dbConnect.none(
    'INSERT INTO users (username, email, password) VALUES (${username}, ${email}, ${password}) ON CONFLICT ON CONSTRAINT unique_email DO NOTHING',
    newUser2
  )
}

async function runSampleUsersData() {
  await initializeUserSample()
  await uniqueEmailConstraint()
  await addSampleUsers()
  initializeAllTablesData()
}

runSampleUsersData()
