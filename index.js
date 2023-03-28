const express = require('express')
const cors = require('cors')
const app = express()
const cookieParser = require('cookie-parser')

require('dotenv').config()

app.use(cors())
app.use(cookieParser())
// Middleware to parse JSON payloads
app.use(express.json())

//Routers for signup/login
const userRouter = require('./routes/userRouter')

app.get('/', function (req, res) {
  res.send('Hello World')
})

app.use('/users', userRouter)

const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log(`Server running on port ${port}`)
})
