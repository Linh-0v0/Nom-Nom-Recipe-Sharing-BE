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
const dbConnect = pgp(process.env.DATABASE_URI)
module.exports = dbConnect

/* -------------------------------------------------- */
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
  addSampleUsers()
}

runSampleUsersData()
