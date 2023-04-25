const db = require('../db')

const countryCtrl = {}

countryCtrl.insert = async (req, res) => {
  try {
    const { countryName } = req.body

    await db.none('INSERT INTO countries (name) VALUES ($1)', [countryName])
    await db.none('UPDATE countries SET id = DEFAULT WHERE id < 0') // Reset ID sequence
    await db.none('ALTER TABLE countries ORDER BY name') // Order table by name

    res.status(200).json({ msg: 'Add successfully.' })
  } catch (err) {
    res.status(500).json({ msg: err })
  }
}

countryCtrl.get = async (req, res) => {
  const { countryId } = req.params
  const country = await db.one(`SELECT * FROM countries WHERE id = $1`, [
    countryId
  ])
  if (country) {
    res.status(200).json(country)
  } else {
    res.status(404).send('Country not found')
  }
}

countryCtrl.getAll = async (req, res) => {
  const country = await db.manyOrNone(`SELECT * FROM countries`)
  if (country) {
    res.status(200).json(country)
  } else {
    res.status(404).send('Countries not found')
  }
}

// countryCtrl.update = async (req, res) => {
//   const { countryId } = req.params
//   const { countryName } = req.body

//   try {
//     await db.result(`UPDATE countries SET name = $1 WHERE id = $2`, [
//       countryName,
//       countryId
//     ])

//     res.status(200).json({ success: 'Update country successfully.' })
//   } catch (err) {
//     res.status(500).json({ msg: err })
//   }
// }

countryCtrl.delete = async (req, res) => {
  const { countryId } = req.params
  try {
    const result = await db.result('DELETE FROM countries WHERE id = $1', [
      countryId
    ])
    //check boolean if the row is deleted
    if (result.rowCount === 1)
      res.status(200).json({ msg: 'Delete Successfully' })
  } catch (err) {
    res.status(500).json({ msg: err })
  }
}

module.exports = countryCtrl
