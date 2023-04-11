const db = require('../db')

const recipeCtrl = {}

//Function insert recipe
recipeCtrl.insert = async (req, res) => {
  const {
    author_id,
    name,
    serving_size,
    duration,
    image_link,
    description
  } = req.body;

  try {
    await db.none(
      `
      INSERT INTO recipe (author_id, name, serving_size, duration, image_link, description)
      VALUES ($1, $2, $3, $4, $5, $6)
    `,
      [
        author_id,
        name,
        serving_size,
        duration,
        image_link,
        description
      ]
    );
    console.log('New recipe added successfully');
    res.sendStatus(201); 
  } catch (err) {
    console.error('Error adding new recipe:', err.message);
    res.sendStatus(500); 
  }
};

//Function get recipe by name 
recipeCtrl.getByName = async (req, res) => {
  const word = req.params.word;
  try {
    const recipes = await db.any('SELECT * FROM recipe WHERE name ILIKE $1', [`%${word}%`]);
    if (recipes.length > 0) {
      res.status(200).json(recipes);
      console.log('Retrived by name successfully')
    } else {
      res.status(404).json({ message: 'No recipes found' });
    }
  } catch (error) {
    console.error('Error retrieving recipes:', error);
    res.status(500).json({ message: 'Error retrieving recipes' });
  }
};

//Function get by user
recipeCtrl.getByUser = async (req, res) => {
  const { author_id } = req.params;
  const recipes = await db.any(
    `SELECT * FROM recipe WHERE author_id = $1`,
    [author_id]
  )
  if (recipes) {
    res.status(200).json(recipes)
  } else {
    res.status(404).send('Recipe not found')
  }
}

//Function get all recipes
recipeCtrl.getAll = async (req, res) => {
    try {
        const recipes = await db.any('SELECT * FROM RECIPE');
        console.log("Retrieved all recipes")
        res.json(recipes);
    } catch (err) {
        console.error('Error retrieving recipes', err.message);
        res.sendStatus(500);
    }
};

//Fuction get 1 recipe by id
recipeCtrl.get = async (req, res) => {
  const { recipe_id } = req.params;
  const recipe = await db.one(
    `SELECT * FROM recipe WHERE recipe_id = $1`,
    [recipe_id]
  )
  if (recipe) {
    res.status(200).json(recipe)
  } else {
    res.status(404).send('Recipe not found')
  }
}

//Fuction update recipe
recipeCtrl.update = async (req, res) => {
    const { recipe_id } = req.params;
    const {
        name,
        serving_size,
        duration,
        image_link,
        origin,
        diet_type,
        description,
      } = req.body;
    
      try {
        await db.none(
          `UPDATE recipe
          SET name = $1,
              serving_size = $2,
              duration = $3,
              image_link = $4,
              origin = $5,
              diet_type = $6,
              description = $7,
              updated_at = NOW()
          WHERE recipe_id = $8`,
          [
            name,
            serving_size,
            duration,
            image_link,
            origin,
            diet_type,
            description,
            recipe_id,
        ]
        );
        console.log(`Updated recipe with recipe_id ${recipe_id}`);
        res.sendStatus(200); 
    } catch (err) {
        console.error(`Error updating recipe with recipe_id ${recipe_id}:`, err.message);
        res.sendStatus(500); 
    }
}


//Fuction delete recipe
recipeCtrl.delete = async (req, res) => {
    const { recipe_id } = req.params;
  
    try {
      await db.none(`DELETE FROM recipe WHERE recipe_id = $1`, [recipe_id]);
      console.log(`Deleted recipe with recipe_id ${recipe_id}`);
      res.sendStatus(204); 
    } catch (err) {
      console.error(`Error deleting recipe with recipe_id ${recipe_id}:`, err.message);
      res.sendStatus(500); 
    }
  };

module.exports = recipeCtrl;
