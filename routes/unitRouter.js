const Unit = require('../controllers/unitCtrl')

const router = require('express').Router()

router.get('/get-all', Unit.getAll)

module.exports = router