const db = require('../db')

const dietaryCtrl = {}

dietaryCtrl.insert = async (req, res) => {
  try {
    const { dietaryName } = req.body

    await db.none('INSERT INTO dietary_pref(name) VALUES ($1)', [dietaryName])

    res.status(200).json({ msg: 'Add successfully.' })
  } catch (err) {
    res.status(500).json({ msg: err })
  }
}

dietaryCtrl.get = async (req, res) => {
  const { dietaryName } = req.params
  const result = await db.one(`SELECT * FROM dietary_pref WHERE name = $1`, [
    dietaryName
  ])
  if (result) {
    res.status(200).json(result)
  } else {
    res.status(404).send('dietary not found')
  }
}

dietaryCtrl.getAll = async (req, res) => {
  const dietary = await db.manyOrNone(`SELECT * FROM dietary_pref`)
  if (dietary) {
    res.status(200).json(dietary)
  } else {
    res.status(404).send('dietary_pref not found')
  }
}

// dietaryCtrl.update = async (req, res) => {
//   try {
//     const { dietaryName } = req.params
//     const { newDietaryName } = req.body
//     await db.result(`UPDATE dietary_pref SET name = $1 WHERE name = $2`, [
//       newDietaryName,
//       dietaryName
//     ])
//     await db.result(`UPDATE recipe_dietary SET dietary_pref = $1 WHERE dietary_pref = $2`, [
//       newDietaryName,
//       dietaryName
//     ])

//     res.status(200).json({ success: 'Update dietary successfully.' })
//   } catch (error) {
//     res.status(500).json({ msg: error })
//   }
// }

dietaryCtrl.delete = async (req, res) => {
  const { dietaryName } = req.params
  try {
    const result = await db.result('DELETE FROM dietary_pref WHERE name = $1', [
      dietaryName
    ])
    //check boolean if the row is deleted
    if (result.rowCount === 1)
      res.status(200).json({ msg: 'Delete Successfully' })
  } catch (err) {
    res.status(500).json({ msg: err })
  }
}

module.exports = dietaryCtrl
