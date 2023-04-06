const pgp = require('pg-promise')()

const connection = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD
}

const db = pgp(connection)

module.exports = db

// Add a sample user to the users table
// db.none('INSERT INTO users(username, email, password) VALUES($1, $2, $3)', [
//   'linh',
//   'johndoe@example.com',
//   '12345'
// ])
//   .then(() => {
//     console.log('Sample user added to the users table')
//   })
//   .catch(error => {
//     console.log('Error:', error)
//   })

// db.one('SELECT * FROM users WHERE id = $1', [1])
// db.one('SELECT * FROM users')
//   .then(data => {
//     console.log('Data:', data)
//   })
//   .catch(error => {
//     console.log('Error:', error)
//   })
