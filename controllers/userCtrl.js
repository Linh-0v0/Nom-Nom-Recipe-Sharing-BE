const db = require('../db')

function createUser({ username, email, password }) {
  const sql = `
    INSERT INTO users (username, email, password)
    VALUES ($1, $2, $3)
    RETURNING *
  `
  return db.one(sql, [username, email, password])
}

function getUserById(id) {
  const sql = 'SELECT * FROM users WHERE id = $1'
  return db.oneOrNone(sql, [id])
}

function getUserByEmail(email) {
  const sql = 'SELECT * FROM users WHERE email = $1'
  return db.oneOrNone(sql, [email])
}

module.exports = {
  createUser,
  getUserById,
  getUserByEmail
}
