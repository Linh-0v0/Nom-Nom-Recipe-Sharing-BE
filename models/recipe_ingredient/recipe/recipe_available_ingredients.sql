CREATE OR REPLACE FUNCTION find_recipes_with_ingredients(
  ingredient_names varchar[]
)
RETURNS TABLE (recipe_id integer, name varchar, num_matching_ingredients bigint) AS
$$
DECLARE
  max_ingredients integer;
BEGIN
  max_ingredients := array_length(ingredient_names, 1);

  RETURN QUERY EXECUTE format('
    SELECT r.recipe_id, r.name, COUNT(ri.ingredient_id) AS num_matching_ingredients
    FROM recipe r
    JOIN recipe_ingredients ri ON r.recipe_id = ri.recipe_id
    JOIN ingredients i ON ri.ingredient_id = i.id
    WHERE i.ing_name = ANY($1)
    GROUP BY r.recipe_id, r.name
    HAVING COUNT(ri.ingredient_id) = %s
  ', max_ingredients) USING ingredient_names;

END;
$$ LANGUAGE plpgsql;

