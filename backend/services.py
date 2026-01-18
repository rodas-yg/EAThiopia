import requests # pyright: ignore[reportMissingModuleSource]
import json
import os
from models import Recipe, db, Ingredient, RecipeIngredient

'''
TODO: replace the api key with environment variable for better security.
'''





def fetch_nutritional_data(food_item):
    api_key = "lD1b7btXh3huOlJ10dXicJ2iHMZcTqUvjYZ17HN7"
    base_url = "https://api.nal.usda.gov/fdc/v1/foods/search"
    '''
    Fetch nutritional data for a given food item from USDA API.
    Args:
        food_item (str): Name of the food item to search for.
    Returns:
        dict: Nutritional data including protein, fats, carbs, and calories.
    '''
    
    assert isinstance(food_item, str), "Food item must be a string"
    try:
        url = f"{base_url}?query={food_item}&pageSize=1&api_key={api_key}"
        response = requests.get(url)
        if response.status_code == 200:
            data = response.json()
            if not data['foods']:
                return json.dumps({"error": "Food item not found"}), 404
            food_nutrients = data['foods'][0]['foodNutrients']
            def get_nutrient(id_list: list):
                for n in food_nutrients:
                    if n['nutrientId'] in id_list:
                        return n['value']
                return None     
            meal_data = {
                "meal_name": data['foods'][0]['description'],
                "protein": get_nutrient([1003, 203]),
                "fats": get_nutrient([204, 1004]),
                "carbs": get_nutrient([205, 1005]),
                "calories": get_nutrient([208, 1008]),
            }
            return meal_data, 200
        else:
            return json.dumps({"error": "Failed to fetch data from USDA API"}), response.status_code
    except Exception as e:
        return json.dumps({"error": str(e)}), 500

def get_recipe_with_cache(recipe_id, source='local'):
    api_key = "rapi_ec4365ae628e6f98017e6b6fefd684b54d2330ba5041e0da"
    base_url = "https://api.spoonacular.com/recipes/complexSearch"
    """
    Retrieves recipe. If it's a new Spoonacular ID, it saves it locally first.
    """
    if source == 'spoonacular':
        cached = Recipe.query.filter_by(spoonacular_id=recipe_id).first()
        if cached:
            return cached

        api_data = _fetch_from_spoonacular_api(recipe_id)
        
        new_recipe = Recipe(
            title=api_data['title'],
            instructions=api_data['instructions'],
            spoonacular_id=recipe_id,
            base_servings=api_data['servings'],
            total_calories=api_data.get('calories', 0)
        )
        db.session.add(new_recipe)
        
        for ing in api_data['ingredients']:
            _link_ingredient_to_recipe(new_recipe.id, ing)
            
        db.session.commit()
        return new_recipe

    return Recipe.query.get(recipe_id)


def _link_ingredient_to_recipe(recipe_id, api_ingredient_data):
    """
    Ensures an ingredient exists in the DB and links it to the recipe.
    api_ingredient_data: dict from Spoonacular
    """
    name = api_ingredient_data['name'].lower().strip()
    amount = api_ingredient_data.get('amount', 0)
    unit = api_ingredient_data.get('unit', 'g')

    ingredient = Ingredient.query.filter_by(name=name).first()

    if not ingredient:
        ingredient = Ingredient(
            name=name,
            unit=unit,

            calories=0, 
            protein=0,
            carbs=0,
            fats=0
        )
        db.session.add(ingredient)
        db.session.flush()

    
    link = RecipeIngredient(
        recipe_id=recipe_id,
        ingredient_id=ingredient.id,
        amount=amount
    )
    db.session.add(link)


def _fetch_from_spoonacular_api(spoonacular_id):
    """
    Calls the Spoonacular Information endpoint and standardizes the output.
    """
    api_key = "rapi_ec4365ae628e6f98017e6b6fefd684b54d2330ba5041e0da"

    url = f"https://api.spoonacular.com/recipes/{spoonacular_id}/information"
    params = {
        "apiKey": api_key,
        "includeNutrition": "true"
    }

    try:
        response = requests.get(url, params=params)
        response.raise_for_status() # Raises an error for 4xx/5xx responses
        data = response.json()
        steps = []
        if data.get('analyzedInstructions'):
            for instruction_set in data['analyzedInstructions']:
                for step in instruction_set.get('steps', []):
                    steps.append(step['step'])
        else:
            steps = [data.get('instructions', "No instructions available.")]

        calories = 0
        nutrition = data.get('nutrition', {}).get('nutrients', [])
        for nutrient in nutrition:
            if nutrient['name'] == 'Calories':
                calories = nutrient['amount']
                break

        return {
            "title": data.get('title'),
            "servings": data.get('servings', 1),
            "instructions": steps, 
            "calories": calories,
            "ingredients": [
                {
                    "name": ing['name'],
                    "amount": ing['amount'],
                    "unit": ing['unit']
                } for ing in data.get('extendedIngredients', [])
            ]
        }

    except Exception as e:
        print(f"Spoonacular API Fetch Error: {e}")
        return None
def format_recipe_with_servings(recipe, requested_servings):
    """
    Adjusts ingredient amounts based on the requested serving size.
    """
    ratio = float(requested_servings) / recipe.base_servings

    adjusted_ingredients = []
    for ri in recipe.recipe_ingredients: 
        adjusted_ingredients.append({
            "name": ri.ingredient.name,
            "original_amount": ri.amount,
            "scaled_amount": round(ri.amount * ratio, 2),
            "unit": ri.ingredient.unit
        })
        
    return {
        "title": recipe.title,
        "instructions": recipe.instructions,
        "current_servings": requested_servings,
        "total_calories": round(recipe.total_calories * ratio, 1),
        "ingredients": adjusted_ingredients
    }