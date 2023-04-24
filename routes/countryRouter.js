const Country = require('../controllers/countryCtrl')

//'router': used to define routes for our application.
//.Router(): telling app to use expressJS to req,res http
const router = require('express').Router()

router.post('/create', Country.insert)
router.get('/get/:countryId', Country.get)
router.get('/get-all', Country.getAll)
// router.patch('/update/:countryId', Country.update)
router.delete('/delete/:countryId', Country.delete)

module.exports = router
