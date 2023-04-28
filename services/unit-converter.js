// converts the quantity of an ingredient from one unit to grams,
// which is then used to calculate the total calories of the ingredient.
function convertUnitToCorrespQuantity(
  originalUnit,
  originalQuantity,
  desiredUnit
) {
  // Define a conversion factor for each unit relative to grams (g)
  const conversionFactors = {
    grams: 1,
    kilograms: 1000,
    milliliters: 1,
    liters: 1000,
    teaspoons: 4.92892,
    tablespoons: 14.7868,
    cups: 236.588,
    ounces: 28.3495,
    pounds: 453.592
  }

  // Convert the original quantity to grams (g)
  const gramsQuantity = originalQuantity * conversionFactors[originalUnit]
  console.log('convertsionFacSTH', originalUnit)
  console.log('gramsQuantity', gramsQuantity)

  // Convert the grams quantity to the desired unit
  const convertedQuantity = gramsQuantity / conversionFactors[desiredUnit]
  console.log('convertedQut', convertedQuantity)

  return convertedQuantity
}

module.exports = { convertUnitToCorrespQuantity }
