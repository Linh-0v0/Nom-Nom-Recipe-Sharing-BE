function convertUnitReturnQuantity(originalUnit, originalQuantity, desiredUnit) {
    // Define a conversion factor for each unit relative to grams (g)
    const conversionFactors = {
      g: 1,
      kg: 1000,
      ml: 1,
      l: 1000,
      tsp: 4.92892,
      tbsp: 14.7868,
      c: 236.588,
      oz: 28.3495,
      lb: 453.592
    };
  
    // Convert the original quantity to grams (g)
    const gramsQuantity = originalQuantity * conversionFactors[originalUnit];
  
    // Convert the grams quantity to the desired unit
    const convertedQuantity = gramsQuantity / conversionFactors[desiredUnit];
  
    return convertedQuantity;
  }
