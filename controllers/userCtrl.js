const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const db = require('../db')
const {
  uploadBytes,
  ref,
  getDownloadURL,
  deleteObject
} = require('firebase/storage')
const { v4: uuidv4 } = require('uuid')
const { storage } = require('../firebaseConfig')
/* ----------------------------------------- */
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
    const { id } = req.params
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
  console.log(req.cookies)
  try {
    const rf_token = req.cookies.refreshToken
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
    const users = await db.any('SELECT * FROM users')
    if (!users) return res.status(400).json({ msg: 'User does not exist.' })

    res.json(users)
  } catch (err) {
    return res.status(500).json({ msg: err.message })
  }
}

userCtrl.updateUserDetails = async (req, res) => {
  try {
    const { username, password, verifypassword } = req.body
    const userId = req.params.userId
    const passwordHash = await bcrypt.hash(password, 10)

    // Find user by id
    const user = await db.oneOrNone('SELECT * FROM users WHERE id=$1', [userId])
    if (!user) return res.status(400).json({ msg: 'User does not exist.' })
    console.log('USER FETCH:', user)

    const passwordMatch = await bcrypt.compare(password, user.password)

    if (!username) {
      return res.status(400).json({ msg: 'Username is required.' })
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ msg: 'Password must be at least 6 characters.' })
    } else if (passwordMatch) {
      return res
        .status(400)
        .json({ msg: 'Password cannot be the same as the old one.' })
    } else if (password !== verifypassword) {
      return res
        .status(400)
        .json({ msg: 'Your password and confirmation password do not match.' })
    }

    // update
    await db.none(
      'UPDATE users SET username = $2, password = $3 WHERE id = $1',
      [userId, username, passwordHash]
    )

    res.status(200).json('Update information successfully!')
  } catch (err) {
    return res.status(500).json({ msg: err.message })
  }
}

userCtrl.resetPassword = async (req, res) => {
  try {
    const { resetToken, userId } = req.params
    const { password } = req.body

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

userCtrl.getAvatarImg = async (req, res) => {
  try {
    const { userId } = req.params

    const user = await db.oneOrNone('SELECT * FROM users WHERE id = $1', [
      userId
    ])
    if (!user) {
      return res.status(400).send('Invalid user email.')
    }
    const userAvatarUrl = await db.oneOrNone(
      'SELECT avatar_url FROM users WHERE id = $1',
      [userId]
    )

    const avatar_url = userAvatarUrl.avatar_url
    const profile_default = 'avatars/021c561a-profile-icon-default.png'
    const storageRef = ref(
      storage,
      `${!avatar_url ? profile_default : avatar_url}`
    )
    console.log(avatar_url)
    getDownloadURL(storageRef).then(url => {
      console.log('Image URL:', url)
      res.status(200).json(url)
    })
    console.log('imageRef Full Path:', storageRef.fullPath)
  } catch (err) {
    return res.status(500).json({ msg: err.message })
  }
}

userCtrl.saveAvatarImg = async (req, res) => {
  try {
    const { userId } = req.params
    const file = req.file

    const user = await db.oneOrNone('SELECT * FROM users WHERE id = $1', [
      userId
    ])
    if (!user) {
      return res.status(400).send('Invalid user email.')
    }
    const userAvatarUrl = await db.oneOrNone(
      'SELECT avatar_url FROM users WHERE id = $1',
      [userId]
    )

    if (userAvatarUrl) {
      // If old avatar exists, Delete the old one on Firestore Cloud
      const oldStorageRef = ref(storage, `${userAvatarUrl.avatar_url}`) //old avatar
      // Delete the file
      deleteObject(oldStorageRef)
        .then(() => {
          console.log('Delete the old image on Firebase Cloud successfully.')
        })
        .catch(error => {
          console.log(error)
        })
    }

    // Save Avatar Image to the Firebase Cloud
    console.log('running save avatar', req.file)
    const storageRef = ref(storage, `/avatars/${uuidv4()}-${file.originalname}`)

    uploadBytes(storageRef, file.buffer)

    const firestoreUrl = storageRef.fullPath
    await db.none('UPDATE users SET avatar_url=$2 WHERE id=$1', [
      userId,
      firestoreUrl
    ])

    res.status(200).json({ msg: 'Uploaded successfully' })
  } catch (err) {
    console.log(err)
    res.status(500).json({ msg: err })
  }
}

/* Dietary_Preference & Country_Preference*/
userCtrl.insertDietaryPreference = async (req, res) => {
  try {
    const { userId } = req.params
    const { dietaryPreference } = req.body //can be array: [Gluten, Vegan] <- dietaryName

    const user = await db.oneOrNone('SELECT * FROM users WHERE id = $1', [
      userId
    ])
    if (!user) {
      return res.status(400).send('Invalid user email.')
    }

    for (const preference of dietaryPreference) {
      const query = `INSERT INTO user_dietary_preferences(user_id, dietary_preference_name) VALUES ($1, $2) ON CONFLICT DO NOTHING`
      await db.none(query, [userId, preference])
    }

    res.status(200).json('Dietary preferences saved successfully')
  } catch (err) {
    return res.status(500).json({ msg: err.message })
  }
}

userCtrl.updateDietaryPreference = async (req, res) => {
  const { userId } = req.params
  const { dietaryPreference } = req.body //can be array: [Gluten, Vegan] <- dietaryName

  const user = await db.oneOrNone('SELECT * FROM users WHERE id = $1', [userId])
  if (!user) {
    return res.status(400).send('Invalid user email.')
  }
  // create an empty array to store promises for updating each dietary preference name
  const promises = []

  // retrieve the existing dietaryPreferenceName values for the user from the database
  db.any(
    'SELECT dietary_preference_name FROM user_dietary_preferences WHERE user_id = $1',
    userId
  )
    .then(existingDietaryPreferences => {
      const existingDietaryPreferenceNames = existingDietaryPreferences.map(
        pref => pref.dietary_preference_name
      )

      // loop through the new dietaryPreferenceName array
      for (let i = 0; i < dietaryPreference.length; i++) {
        const name = dietaryPreference[i]

        // check if the new name already exists in the database
        if (existingDietaryPreferenceNames.includes(name)) {
          // if it does, remove it from the existing names array to prevent it from being deleted
          existingDietaryPreferenceNames.splice(
            existingDietaryPreferenceNames.indexOf(name),
            1
          )
        } else {
          // if it doesn't, generate the insert query for this name
          const insertQuery = `INSERT INTO user_dietary_preferences (user_id, dietary_preference_name) VALUES ($1, $2)`
          const insertValues = [userId, name]

          // add the promise for this insert to the promises array
          promises.push(db.none(insertQuery, insertValues))
        }

        // generate the update query string for this dietary preference name
        const updateQuery = `UPDATE user_dietary_preferences SET dietary_preference_name = $1 WHERE user_id = $2 AND dietary_preference_name = $3`
        const updateValues = [name, userId, name]

        // add the promise for this update to the promises array
        promises.push(db.none(updateQuery, updateValues))
      }

      // generate the delete query strings for the remaining existing dietary preference names
      const deleteQueries = existingDietaryPreferenceNames.map(name => ({
        query: `DELETE FROM user_dietary_preferences WHERE user_id = $1 AND dietary_preference_name = $2`,
        values: [userId, name]
      }))

      // add the promises for the delete queries to the promises array
      deleteQueries.forEach(deleteQuery => {
        promises.push(db.none(deleteQuery.query, deleteQuery.values))
      })

      // execute all of the queries using Promise.all
      Promise.all(promises)
        .then(() => {
          console.log('User dietary preferences updated successfully')
          res.status(200).send('User dietary preferences updated successfully')
        })
        .catch(error => {
          console.error(error)
          res.status(500).send('Internal server error')
        })
    })
    .catch(error => {
      console.error(error)
      res.status(500).send('Internal server error')
    })
}

userCtrl.getDietaryPreference = async (req, res) => {
  try {
    const { userId } = req.params
    const user = await db.oneOrNone('SELECT * FROM users WHERE id = $1', [
      userId
    ])
    if (!user) {
      return res.status(400).send('Invalid user email.')
    }
    const userDietaryPref = await db.manyOrNone(
      'SELECT dietary_preference_name FROM user_dietary_preferences WHERE user_id = $1',
      userId
    )
    res.status(200).json({ msg: userDietaryPref })
  } catch (err) {
    return res.status(500).json({ msg: err.message })
  }
}

userCtrl.getCountryPreference = async (req, res) => {
  try {
    const { userId } = req.params
    const user = await db.oneOrNone('SELECT * FROM users WHERE id = $1', [
      userId
    ])
    if (!user) {
      return res.status(400).send('Invalid user email.')
    }
    const userCountryPref = await db.manyOrNone(
      'SELECT country_preference_id FROM user_country_preferences WHERE user_id = $1',
      userId
    )
    res.status(200).json({ msg: userCountryPref })
  } catch (err) {
    return res.status(500).json({ msg: err.message })
  }
}

userCtrl.insertCountryPreference = async (req, res) => {
  try {
    const { userId } = req.params
    const { countryPreference } = req.body //can be array: [Gluten, Vegan] <- dietaryName

    const user = await db.oneOrNone('SELECT * FROM users WHERE id = $1', [
      userId
    ])
    if (!user) {
      return res.status(400).send('Invalid user email.')
    }

    for (const preference of countryPreference) {
      const query = `INSERT INTO user_country_preferences(user_id, country_preference_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`
      await db.none(query, [userId, preference])
    }

    res.status(200).json('Country preferences saved successfully')
  } catch (err) {
    return res.status(500).json({ msg: err.message })
  }
}

userCtrl.updateCountryPreference = async (req, res) => {
  const { userId } = req.params
  const { countryPreference } = req.body // can be an array: [USA, Canada, Mexico] <- country names

  const user = await db.oneOrNone('SELECT * FROM users WHERE id = $1', [userId])

  if (!user) {
    return res.status(400).send('Invalid user email.')
  }

  // create an empty array to store promises for updating each country preference name
  const promises = []

  // retrieve the existing countryPreferenceName values for the user from the database
  db.any(
    'SELECT country_preference_id FROM user_country_preferences WHERE user_id = $1',
    userId
  )
    .then(existingCountryPreferences => {
      const existingCountryPreferenceNames = existingCountryPreferences.map(
        pref => pref.country_preference_id
      )

      // loop through the new countryPreferenceName array
      for (let i = 0; i < countryPreference.length; i++) {
        const name = countryPreference[i]

        // check if the new name already exists in the database
        if (existingCountryPreferenceNames.includes(name)) {
          // if it does, remove it from the existing names array to prevent it from being deleted
          existingCountryPreferenceNames.splice(
            existingCountryPreferenceNames.indexOf(name),
            1
          )
        } else {
          // if it doesn't, generate the insert query for this name
          const insertQuery = `INSERT INTO user_country_preferences (user_id, country_preference_id) VALUES ($1, $2)`
          const insertValues = [userId, name]

          // add the promise for this insert to the promises array
          promises.push(db.none(insertQuery, insertValues))
        }

        // generate the update query string for this country preference name
        const updateQuery = `UPDATE user_country_preferences SET country_preference_id = $1 WHERE user_id = $2 AND country_preference_id = $3`
        const updateValues = [name, userId, name]

        // add the promise for this update to the promises array
        promises.push(db.none(updateQuery, updateValues))
      }

      // generate the delete query strings for the remaining existing country preference names
      const deleteQueries = existingCountryPreferenceNames.map(name => ({
        query: `DELETE FROM user_country_preferences WHERE user_id = $1 AND country_preference_id = $2`,
        values: [userId, name]
      }))

      // add the promises for the delete queries to the promises array
      deleteQueries.forEach(deleteQuery => {
        promises.push(db.none(deleteQuery.query, deleteQuery.values))
      })

      // execute all of the queries using Promise.all
      Promise.all(promises)
        .then(() => {
          console.log('User country preferences updated successfully')
          res.status(200).send('User country preferences updated successfully')
        })
        .catch(error => {
          console.error(error)
          res.status(500).send('Internal server error')
        })
    })
    .catch(error => {
      console.error(error)
      res.status(500).send('Internal server error')
    })
}

module.exports = userCtrl
