const db = require('../db')

const reset_pass_token_auth = async (req, res, next) => {
  try {
    const { resetToken, userId } = req.params
    //Check if reset_token is in the database
    const user = await db.oneOrNone(
      'SELECT * FROM users WHERE id = $1 AND reset_token = $2',
      [userId, resetToken]
    )

    if (!user) {
      return res.status(400).send('Invalid or expired reset token form Auth')
    }
    // check if token is more than 1 hour
    // Date.now() returns miliseconds
    if (user.reset_token_expiration < Date.now() - 3600000) {
      return res.status(400).send('Reset Password Token has expired from Auth.')
    }
    next()
  } catch (err) {
    return res.status(500).json({ msg: err.message })
  }
}

module.exports = reset_pass_token_auth
