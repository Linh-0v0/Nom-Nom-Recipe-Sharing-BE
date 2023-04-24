const Dietary = require('../controllers/dietaryCtrl')

//'router': used to define routes for our application.
//.Router(): telling app to use expressJS to req,res http
const router = require('express').Router()

router.post('/create', Dietary.insert)
router.get('/get/:dietaryName', Dietary.get)
router.get('/get-all', Dietary.getAll)
// router.patch('/update/:dietaryName', Dietary.update)
router.delete('/delete/:dietaryName', Dietary.delete)

module.exports = router
