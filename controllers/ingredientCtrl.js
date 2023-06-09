const db = require('../db')

const ingredientCtrl = {}

ingredientCtrl.insert = async (req, res) => {
  const {
    ing_name,
    quantity,
    unit_name,
    calories,
    carb,
    protein,
    fat,
    sugar,
    sodium,
    fiber,
    cholesterol,
    vitamin_a,
    vitamin_b12,
    vitamin_b6,
    vitamin_c,
    vitamin_d,
    vitamin_e,
    vitamin_k,
    potassium,
    calcium,
    iron
  } = req.body

  await db
    .none(
      `
  INSERT INTO ingredients(ing_name, quantity, unit_name, calories, carb, protein, fat, sugar, sodium, fiber, cholesterol,vitamin_a, vitamin_b12, vitamin_b6, vitamin_c, vitamin_d, vitamin_e, vitamin_k, potassium, calcium, iron)
  VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
`,
      [
        ing_name,
        quantity,
        unit_name,
        calories,
        carb,
        protein,
        fat,
        sugar,
        sodium,
        fiber,
        cholesterol,
        vitamin_a,
        vitamin_b12,
        vitamin_b6,
        vitamin_c,
        vitamin_d,
        vitamin_e,
        vitamin_k,
        potassium,
        calcium,
        iron
      ]
    )
    .then(() => {
      res.status(200).json({ msg: 'Add successfully.' })
    })
    .catch(error => {
      res.status(500).json({ msg: error })
    })
}

ingredientCtrl.get = async (req, res) => {
  const { ingredientId } = req.params
  const ingredient = await db.one(`SELECT * FROM ingredients WHERE id = $1`, [
    ingredientId
  ])
  if (ingredient) {
    res.status(200).json(ingredient)
  } else {
    res.status(404).send('Ingredient not found')
  }
}

ingredientCtrl.getAll = async (req, res) => {
  const ingredient = await db.manyOrNone(`SELECT * FROM ingredients`)
  if (ingredient) {
    res.status(200).json(ingredient)
  } else {
    res.status(404).send('Ingredient not found')
  }
}

ingredientCtrl.update = async (req, res) => {
  const { ingredientId } = req.params
  const {
    ing_name,
    quantity,
    unit_name,
    calories,
    carb,
    protein,
    fat,
    sugar,
    sodium,
    fiber,
    cholesterol,
    vitamin_a,
    vitamin_b12,
    vitamin_b6,
    vitamin_c,
    vitamin_d,
    vitamin_e,
    vitamin_k,
    potassium,
    calcium,
    iron
  } = req.body

  try {
    await db.result(
      `UPDATE ingredients SET
      ing_name = $1,
      quantity = $2,
      unit_name = $3,
      calories = $4,
      carb = $5,
      protein = $6,
      fat = $7,
      sugar = $8,
      sodium = $9,
      fiber = $10,
      cholesterol = $11,
      vitamin_a = $12,
      vitamin_b12 = $13,
      vitamin_b6 = $14,
      vitamin_c = $15,
      vitamin_d = $16,
      vitamin_e = $17,
      vitamin_k = $18,
      potassium = $19,
      calcium = $20, 
      iron = $21
    WHERE id = $22`,
      [
        ing_name,
        quantity,
        unit_name,
        calories,
        carb,
        protein,
        fat,
        sugar,
        sodium,
        fiber,
        cholesterol,
        vitamin_a,
        vitamin_b12,
        vitamin_b6,
        vitamin_c,
        vitamin_d,
        vitamin_e,
        vitamin_k,
        potassium,
        calcium,
        iron,
        ingredientId
      ]
    )

    res.status(200).json({ success: 'Update ingredient successfully.' })
  } catch (error) {
    res.status(500).json({ msg: err })
  }
}

ingredientCtrl.delete = async (req, res) => {
  const { ingredientId } = req.params
  try {
    const result = await db.result('DELETE FROM ingredients WHERE id = $1', [
      ingredientId
    ])
    //check boolean if the row is deleted
    if (result.rowCount === 1)
      res.status(200).json({ msg: 'Delete Successfully' })
  } catch (err) {
    res.status(500).json({ msg: err })
  }
}

module.exports = ingredientCtrl
