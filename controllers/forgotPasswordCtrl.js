const db = require('../db')

const forgotPassword = async (req, res) => {
  const { email } = req.body

  try {
    // Check if user exists
    const user = await db.oneOrNone('SELECT * FROM users WHERE email = $1', [
      email
    ])
    if (!user) {
      return res.status(400).json({ msg: 'User does not exist!' })
    }
    const user_id = user.id
    console.log('USERID:', user_id)
    // await db.none('INSERT INTO google_tokens(user_id) VALUES($1)', [user_id])

    // Generate a password reset token & save to user database
    const resetToken = Math.floor(Math.random() * 100000000)
    // const resetToken = jwt.sign(user, process.env.SECRET_KEY, { expiresIn: '60m' })

    const resetTokenExpiration = new Date(Date.now() + 3600000) // One hour from now
    const updateTokenQuery =
      'UPDATE users SET reset_token = $1, reset_token_expiration = $2 WHERE email = $3'

    await db.none(updateTokenQuery, [resetToken, resetTokenExpiration, email])

    res.redirect(`/mail-reset-pass/${email}`)
  } catch (err) {
    console.log(err)
    res.status(500).json({ msg: err })
  }
}

module.exports = forgotPassword
