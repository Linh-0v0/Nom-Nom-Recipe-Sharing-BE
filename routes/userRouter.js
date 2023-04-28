const User = require('../controllers/userCtrl')
const forgotPassword = require('../controllers/forgotPasswordCtrl')
const sendPasswordResetMail = require('../controllers/sendPasswordResetMail')
const user_auth = require('../middleware/user_auth')
const reset_pass_token_auth = require('../middleware/reset_pass_token_auth')
const {
  getAuthUrl,
  getAccessToken,
  getNewAccessToken,
  googleCallBack
} = require('../controllers/google_auth')
const { upload, storage } = require('../services/multerHandleImg')

//'router': used to define routes for our application.
//.Router(): telling app to use expressJS to req,res http
const router = require('express').Router()

router.post('/auth/register', User.register)
router.post('/auth/login', User.login)
router.get('/auth/logout', User.logout)
router.get('/auth/refresh_token', User.refreshToken)
router.post('/forgot-password', forgotPassword)
router.post(
  '/reset-password/:resetToken/:userId',
  reset_pass_token_auth,
  User.resetPassword
)

router.patch('/user/update-profile/:userId', User.updateUserDetails)
router.post(
  '/user/update-avatar/:userId',
  upload.single('avatarImage'),
  User.saveAvatarImg
)
router.get('/user/get-avatar/:userId', User.getAvatarImg)
router.get('/user/my-profile', user_auth, User.getUser)
router.get('/users', User.getAllUsers)

//allow users to grant permission to your app to access their Google account.
router.get('/auth/google', (req, res) => {
  const authUrl = getAuthUrl() //returns the authorization URL
  console.log('authURL: ', authUrl)
  res.redirect(authUrl)
})

//Google will redirect the user to this route after they grant permission to your app
// router.get('/auth/google/callback', googleCallBack)
router.get('/auth/google/callback', googleCallBack)
router.get('/mail-reset-pass/:email', sendPasswordResetMail)

//Dietary & Country Preferences
router.get('/get-dietary-preference/:userId', User.getDietaryPreference)
router.post('/insert-dietary-preference/:userId', User.insertDietaryPreference)
router.patch('/update-dietary-preference/:userId', User.updateDietaryPreference)
router.get('/get-country-preference/:userId', User.getCountryPreference)
router.post('/insert-country-preference/:userId', User.insertCountryPreference)
router.patch('/update-country-preference/:userId', User.updateCountryPreference)

module.exports = router
