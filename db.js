const pgp = require('pg-promise')()

const db = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: "nom_nom",
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD
}


const dbConnect = pgp(db)
module.exports = dbConnect
