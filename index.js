const express = require('express')
const session = require('express-session')
const cors = require('cors')
const app = express()
const cookieParser = require('cookie-parser')
// const server = require("http").createServer(app);

require('dotenv').config()

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true
}));

app.use(cors())
app.use(cookieParser())

// Middleware to parse JSON payloads
app.use(express.json())

//Routers for signup/login/logout
app.use('/', require('./routes/userRouter'))
app.use('/recipe', require('./routes/recipeRouter'))
app.use('/collection', require('./routes/collectionRouter'))

app.get('/', function (req, res) {
  res.send('Hello World')
})

// require('./db')

const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log(`Server running on port ${port}`)
})
