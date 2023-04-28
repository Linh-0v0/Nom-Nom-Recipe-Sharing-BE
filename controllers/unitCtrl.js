const db = require('../db')

const unitCtrl = {}

unitCtrl.getAll = async (req, res) => {
  const units = await db.any(`SELECT * FROM units`)
  if (units) {
    res.status(200).json(units)
  } else {
    res.status(404).send('Units not found')
  }
}

module.exports = unitCtrl
