const db = require('../db')
const nodemailer = require('nodemailer')

const sendPasswordResetMail = async (req, res) => {
  const email = await req.params.email
  console.log('emailll', email)
  try {
    const hourAgo = new Date(Date.now() - 60 * 60 * 1000) // get the time one hour ago

    const user = await db.oneOrNone(
      'SELECT * FROM users WHERE email = $1 AND reset_token_expiration > $2',
      [email, hourAgo]
    )

    if (!user) {
      return res.status(400).json({ msg: 'Reset Password Token is expired' })
    }

    const resetToken = user.reset_token
    const user_id = user.id
    const resetLink = `http://localhost:3000/reset-password/${resetToken}/${user_id}`

    const googleTokenData = await db.oneOrNone(
      'SELECT * FROM google_tokens WHERE id = $1',
      1
    )
    if (!googleTokenData) {
      return res.status(400).json({ msg: 'Google Token out of date.' })
    }

    // console.log('access', googleTokenData)
    console.log('userID', user_id)
    console.log('userResetToken', resetToken)

    // Create a Nodemailer transporter object
    // 'user' in auth: the sender
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: process.env.EMAIL_USER,
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        refreshToken: googleTokenData.refresh_token,
        accessToken: googleTokenData.access_token,
        expires: googleTokenData.expires_in
      }
    })

    const mailOptions = {
      from: 'nommnommrecipe@gmail.com',
      to: email,
      subject: 'Nom Nom Password Reset',
      html: `<h1>Reset Your Password</h1><p>Click <a href="${resetLink}">here</a> to reset your password. This link will expire in 1 hour.</p>`
    }

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.log(err)
        return res.status(500).json({ msg: 'Error sending email' })
      } else {
        console.log(info)
        return res
          .status(200)
          .json({ msg: 'Password reset token sent to email' })
      }
    })
  } catch (err) {
    console.log(err)
    res.status(500).json({ msg: err })
  }
}

module.exports = sendPasswordResetMail
