const db = require('../db')
const { google } = require('googleapis')
const { OAuth2Client } = require('google-auth-library')
require('dotenv').config()

const getOAuth2Client = () => {
  const oAuth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  )

  return oAuth2Client
}

// // Create a new OAuth2Client instance
// const oauth2Client = new OAuth2Client({
//   clientId: process.env.GOOGLE_CLIENT_ID,
//   clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//   redirectUri: process.env.GOOGLE_REDIRECT_URI
// });

// Define the Google OAuth2 scopes your app will need
const scopes = [
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://mail.google.com/'
]

// Get the Google OAuth2 consent page URL
const getAuthUrl = () => {
  const oAuth2Client = getOAuth2Client()
  return oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'select_account'  
  })
}

// Get the access token and refresh token using the authorization code
const getAccessToken = async code => {
  try {
    const oAuth2Client = getOAuth2Client()

    const { tokens } = await oAuth2Client.getToken(code)

    console.log('TOKEN:', tokens)
    return tokens
  } catch (error) {
    console.error(error)
  }
}

// Use the refresh token to get a new access token
const getNewAccessToken = async refreshToken => {
  try {
    const oAuth2Client = getOAuth2Client()
    oAuth2Client.setCredentials({
      refresh_token: 123456
    })
    const { tokens } = await oAuth2Client.refreshAccessToken()
    return tokens.access_token
  } catch (error) {
    console.error(error)
  }
}

const googleCallBack = async (req, res) => {
  const code = req.query.code
  //'getGoogleAccessToken': obtains the access token and refresh token using the authorization code provided in the 'code'.
  const tokens = await getAccessToken(code)
  // Do something with the tokens, e.g. save them in the database or use them to send emails
  console.log('Tokens:', tokens)
  // const user_id = req.session.userid
  // console.log('Tokensuserid:', user_id)

  // check if the row exists
  await db.oneOrNone('SELECT * FROM google_tokens WHERE id = $1', [1])
    .then(row => {
      if (row) {
        // update existing row
        return db.none(
          'UPDATE google_tokens SET refresh_token = $1, access_token = $2, expires_in = $3 WHERE id = $4',
          [tokens.refresh_token, tokens.access_token, tokens.expiry_date, row.id]
        )
      } else {
        // insert new row
        return db.none(
          'INSERT INTO google_tokens (refresh_token, access_token, expires_in) VALUES ($1, $2, $3)',
          [tokens.refresh_token, tokens.access_token, tokens.expiry_date]
        )
      }
    })
    .then(() => {
      // success
      console.log('Row updated or inserted successfully')
    })
    .catch(error => {
      // error handling
      console.error('Error:', error)
    })
  // await db.none('INSERT INTO pass_reset_request(refresh_token, access_token, expires_in) VALUES($1, $2, $3)', [tokens.refresh_token, tokens.access_token, tokens.expiry_date])

  // req.session.gg_refresh_token = tokens.refresh_token
  // req.session.gg_access_token = tokens.access_token
  // req.session.gg_expires = tokens.expiry_date
  // console.log('refresh:', req.session.gg_refresh_token)
  // console.log('refresh:', tokens.refresh_token)

  res.send("Get new Google authorization Token for Company's email to enable 'Sending mail to Users' successfully!")
}

module.exports = {
  getOAuth2Client,
  getAuthUrl,
  getAccessToken,
  getNewAccessToken,
  googleCallBack
}
