const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const db = require('../db')

const userCtrl = {}

/* USER AUTH */
// Function to register a new user
userCtrl.register = async (req, res) => {
  const { username, email, password, verifypassword } = req.body

  // Validate if user exist in our database
  const oldEmail = await db.oneOrNone('SELECT * FROM users WHERE email = $1', [
    email
  ])
  const oldName = await db.oneOrNone(
    'SELECT * FROM users WHERE username = $1',
    [username]
  )

  if (oldEmail) {
    return res
      .status(400)
      .json({ msg: 'UserEmail Already Exist. Please Login' })
  } else if (oldName) {
    return res
      .status(400)
      .json({ msg: 'UserName Already Exist. Change username please.' })
  } else if (password.length < 6) {
    return res
      .status(400)
      .json({ msg: 'Password must be at least 6 characters.' })
  } else if (password !== verifypassword) {
    return res
      .status(400)
      .json({ msg: 'Your password and confirmation password do not match.' })
  }

  // Hash the password before saving it to the database
  const hashedPassword = await bcrypt.hash(password, 10)

  // Save the new user to the database
  try {
    const user = await db.one(
      'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id',
      [username, email, hashedPassword]
    )

    const accesstoken = createAccessToken({ id: user.id })
    const refreshtoken = createRefreshToken({ id: user.id })

    res.cookie('refreshToken', refreshtoken, {
      //HttpOnly to prevent XSS attacks
      httpOnly: true,
      path: '/auth/refresh_token',
      maxAge: 60 * 60 * 24 * 7 * 1000 //7d
    })

    res.status(200).json({
      msg: 'User created successfully!',
      user: user,
      accesstoken: accesstoken,
      refreshtoken: refreshtoken
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: error })
  }
}

// Function to log in a user and generate a JWT
userCtrl.login = async (req, res) => {
  const { email, password } = req.body

  // Check if the user email exists in the database
  try {
    const user = await db.oneOrNone('SELECT * FROM users WHERE email = $1', [
      email
    ])

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    // Check if the provided password matches the hashed password in the database
    const passwordMatch = await bcrypt.compare(password, user.password)

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    const accesstoken = createAccessToken({ id: user.id })
    const refreshtoken = createRefreshToken({ id: user.id })

    res.cookie('refreshToken', refreshtoken, {
      //HttpOnly to prevent XSS attacks
      httpOnly: true,
      path: '/auth/refresh_token',
      maxAge: 60 * 60 * 24 * 7 * 1000 //7d
    })

    res.json({
      user: user,
      accesstoken: accesstoken,
      refreshtoken: refreshtoken
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Server error' })
  }
}

userCtrl.logout = async (req, res) => {
  try {
    res.clearCookie('refreshToken', { path: '/auth/refresh_token' })
    return res.json({ msg: 'Logged out' })
  } catch (err) {
    return res.status(500).json({ msg: err.message })
  }
}

userCtrl.delete = async (req, res) => {
  try {
    const {id} = req.params
    const user = await db.oneOrNone('SELECT * FROM users WHERE id = $1', [id])
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }
    
    await db.oneOrNone('DELETE FROM users WHERE id = $1', [id])
    return res.status(200).json({ msg: 'User deleted' })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Server error' })
  }
}

/* JWT TOKEN */
const createAccessToken = user => {
  console.log('userid', user)
  return jwt.sign(user, process.env.ACCESS_TOKEN_KEY, { expiresIn: '12h' })
}

const createRefreshToken = user => {
  return jwt.sign(user, process.env.REFRESH_TOKEN_KEY, { expiresIn: '7d' })
}

userCtrl.refreshToken = (req, res) => {
  // refreshToken is used to obtain accessToken.
  // accessToken is used to access user's resources.
  // refreshToken expires = user logs in again -> New refreshToken.
  try {
    const rf_token = req.cookies.refreshtoken
    if (!rf_token)
      return res.status(400).json({ msg: 'Please Login or Register' })

    jwt.verify(rf_token, process.env.REFRESH_TOKEN_KEY, (err, user) => {
      if (err) return res.status(400).json({ msg: 'Please Login or Register' })
      const accesstoken = createAccessToken({ id: user._id })
      res.json({ user, accesstoken })
    })
    // res.json({ rf_token });
  } catch (err) {
    return res.status(500).json({ msg: err.message })
  }
}

/* USER CRUD */
userCtrl.getUser = async (req, res) => {
  try {
    const user = await db.oneOrNone('SELECT * FROM users WHERE id=$1', [
      req.user.id
    ])
    if (!user) return res.status(400).json({ msg: 'User does not exist.' })

    res.json({ user: user })
  } catch (err) {
    return res.status(500).json({ msg: err.message })
  }
}

userCtrl.getAllUsers = async (req, res) => {
  try {
    const users = await db.one('SELECT * FROM users')
    if (!users) return res.status(400).json({ msg: 'User does not exist.' })

    res.json(users)
  } catch (err) {
    return res.status(500).json({ msg: err.message })
  }
}

userCtrl.updateUser = async (req, res) => {
  try {
    const { username, email, password } = req.body
    const user_id = req.user.id
    const passwordHash = await bcrypt.hash(password, 10)

    // Find user by id
    const user = await db.oneOrNone('SELECT * FROM users WHERE id=$1', [
      user_id
    ])
    if (!user) return res.status(400).json({ msg: 'User does not exist.' })

    // update
    const updateUser = await db.oneOrNone(
      'UPDATE users SET username = $1, email = $2, password = $3 WHERE id = $4',
      [username, email, passwordHash, user_id]
    )

    // remove password from the response
    delete updateUser.password

    res.status(200).json(updateUser)
  } catch (err) {
    return res.status(500).json({ msg: err.message })
  }
}

userCtrl.resetPassword = async (req, res) => {
  try {
    const { resetToken, userId } = req.params
    const { password } = req.body

    //Check if reset_token is in the database
    const user = await db.oneOrNone('SELECT * FROM users WHERE id = $1', [
      userId
    ])

    if (!user) {
      return res.status(400).send('Invalid user email.')
    }

    // Update the user's password and remove the reset token
    const hashedPassword = await bcrypt.hash(password, 10)
    await db.none(
      'UPDATE users SET password = $1, reset_token = NULL, reset_token_expiration = NULL WHERE id = $2',
      [hashedPassword, userId]
    )

    res.send('Password has been reset')
  } catch (err) {
    return res.status(500).json({ msg: err.message })
  }
}

module.exports = userCtrl
