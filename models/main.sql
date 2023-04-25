-- THE ORDER OF CREATING TABLE MATTERS

-- user_mgm
\i models/user_mgm/google_tokens.sql

-- recipe_ingredient
\i models/recipe_ingredient/countries.sql
\i models/recipe_ingredient/dietary_pref.sql
\i models/recipe_ingredient/ingredients.sql
\i models/recipe_ingredient/units.sql

-- recipe_ingredient/recipe
\i models/recipe_ingredient/recipe/recipe.sql
\i models/recipe_ingredient/recipe/recipe_ingredients.sql
\i models/recipe_ingredient/recipe/recipe_dietary.sql
\i models/recipe_ingredient/recipe/recipe_country.sql

-- recipe_ingredient/users
\i models/recipe_ingredient/users/user_country_pref.sql
\i models/recipe_ingredient/users/user_dietary_pref.sql


-- 
\i models/collection.sql