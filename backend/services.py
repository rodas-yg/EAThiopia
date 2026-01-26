import requests 
import json
import os
import re
import google.generativeai as genai
from dotenv import load_dotenv 
from models import Recipe, db, Ingredient, RecipeIngredient, WeightLog, User, UserStats
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from sklearn.linear_model import LinearRegression
import numpy as np
import pandas as pd
from datetime import timedelta, datetime
load_dotenv() 

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
spoonacular_api_key =  "rapi_ec4365ae628e6f98017e6b6fefd684b54d2330ba5041e0da"
usda_api_key = os.getenv("usda_api_key")
GOOGLE_API_KEY = os.getenv("gemini_key")

# --- CONFIGURE AI ---
if GOOGLE_API_KEY:
    genai.configure(api_key=GOOGLE_API_KEY)

def generate_ai_recipe(food_name):
    """
    Uses Gemini to generate a quick recipe.
    Improved: Falls back to raw text if JSON fails.
    """
    if not GOOGLE_API_KEY:
        print("ERROR: GOOGLE_API_KEY is missing in .env")
        return "Please add GOOGLE_API_KEY to your .env file to see recipes."
        
    try:
        # Use 'gemini-1.5-flash' (Faster/Newer) or fallback to 'gemini-pro'
        model = genai.GenerativeModel('gemini-2.5-flash')
        
        prompt = f"""
        Write a simple cooking recipe for {food_name}.
        Include ingredients and steps.
        Format it as a JSON object with keys: "description", "ingredients" (list), "instructions" (list), "prepTime", "cookTime".
        If you cannot use JSON, just write the recipe in plain text.
        """
        
        response = model.generate_content(prompt)
        text_output = response.text

        # 1. Try to extract JSON
        try:
            match = re.search(r'\{.*\}', text_output, re.DOTALL)
            if match:
                return json.loads(match.group(0))
        except:
            pass # JSON failed? No problem, move to step 2.

        # 2. Fallback: Return the raw text! 
        # (The Frontend now knows how to handle plain text)
        print(f"AI returned text format for {food_name} (this is good!)")
        return text_output
            
    except Exception as e:
        print(f"!!! AI API CRITICAL ERROR: {e}")
        return "Recipe currently unavailable due to API connection issue."

def fetch_nutritional_data(food_item):
    """
    Fetch nutritional data from USDA API and append AI Recipe.
    """
    base_url = "https://api.nal.usda.gov/fdc/v1/foods/search"
    
    assert isinstance(food_item, str), "Food item must be a string"
    try:
        url = f"{base_url}?query={food_item}&pageSize=1&api_key={usda_api_key}"
        response = requests.get(url)
        
        if response.status_code == 200:
            data = response.json()
            if not data.get('foods'):
                return json.dumps({"error": "Food item not found"}), 404
                
            food_nutrients = data['foods'][0]['foodNutrients']
            
            def get_nutrient(id_list):
                for n in food_nutrients:
                    if n['nutrientId'] in id_list:
                        return n['value']
                return 0

            meal_name = data['foods'][0]['description']

            meal_data = {
                "meal_name": meal_name,
                "protein": get_nutrient([1003, 203]),
                "fats": get_nutrient([204, 1004]),
                "carbs": get_nutrient([205, 1005]),
                "calories": get_nutrient([208, 1008]),
                "image": None, 
            }

            print(f"Fetching recipe for: {meal_name}...") 
            ai_recipe = generate_ai_recipe(meal_name)
            
            if isinstance(ai_recipe, dict):
                meal_data["recipe"] = ai_recipe
                meal_data["ingredients"] = ai_recipe.get("ingredients", [])
                meal_data["description"] = ai_recipe.get("description", "USDA Food Item")
            else:
                meal_data["recipe"] = ai_recipe 
                meal_data["ingredients"] = [] 
                meal_data["description"] = "USDA Food Item"

            return meal_data, 200
        else:
            print(f"USDA API Error: {response.status_code}") 
            return json.dumps({"error": "Failed to fetch data from USDA API"}), response.status_code
    except Exception as e:
        print(f"Exception in service: {e}") 
        return json.dumps({"error": str(e)}), 500

def get_recipe_with_cache(recipe_id, source='local'):
    if source == 'spoonacular':
        cached = Recipe.query.filter_by(spoonacular_id=recipe_id).first()
        if cached:
            return cached

        api_data = _fetch_from_spoonacular_api(recipe_id)
        if not api_data:
            return None
        
        new_recipe = Recipe(
            title=api_data['title'],
            instructions=api_data['instructions'],
            spoonacular_id=recipe_id,
            base_servings=api_data.get('servings', 1),
            total_calories=api_data.get('calories', 0)
        )
        db.session.add(new_recipe)
        db.session.flush() 

        for ing in api_data['ingredients']:
            _link_ingredient_to_recipe(new_recipe.id, ing)
            
        db.session.commit()
        return new_recipe 

    return Recipe.query.get(recipe_id)

def _link_ingredient_to_recipe(recipe_id, api_ingredient_data):
    name = api_ingredient_data['name'].lower().strip()
    amount = api_ingredient_data.get('amount', 0)
    unit = api_ingredient_data.get('unit', 'g')

    ingredient = Ingredient.query.filter_by(name=name).first()

    if not ingredient:
        ingredient = Ingredient(
            name=name,
            unit=unit,
            calories_per_unit=0, 
            protein_per_unit=0,
            carbs_per_unit=0,
            fats_per_unit=0
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
    url = f"https://api.spoonacular.com/recipes/{spoonacular_id}/information"
    params = {
        "apiKey": spoonacular_api_key,
        "includeNutrition": "true"
    }

    try:
        response = requests.get(url, params=params)
        response.raise_for_status() 
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
    
def verify_google_token(token):
    try:
        id_info = id_token.verify_oauth2_token(
            token, 
            google_requests.Request(), 
            GOOGLE_CLIENT_ID
        )

        return {
            "google_id": id_info['sub'],
            "email": id_info['email'],
            "name": id_info.get('name'),
            "picture": id_info.get('picture')
        }
    except ValueError as e:
        print(f"Token verification failed: {e}")
        return None

def search_recipes_spoonacular(query):
    url = "https://api.spoonacular.com/recipes/complexSearch"
    params = {
        "apiKey": spoonacular_api_key, 
        "query": query,
        "number": 12, 
        "addRecipeInformation": "true",
        "addRecipeNutrition": "true",
        "instructionsRequired": "true"
    }
    
    try:
        response = requests.get(url, params=params)
        if response.status_code != 200:
            return []
            
        data = response.json()
        results = []
        
        for item in data.get('results', []):
            cal = 0
            pro = 0
            fat = 0
            carb = 0
            
            for n in item.get('nutrition', {}).get('nutrients', []):
                if n['name'] == 'Calories': cal = n['amount']
                if n['name'] == 'Protein': pro = n['amount']
                if n['name'] == 'Fat': fat = n['amount']
                if n['name'] == 'Carbohydrates': carb = n['amount']
            
            ingredients = [ing['original'] for ing in item.get('extendedIngredients', [])]
            
            instructions = []
            for instruction in item.get('analyzedInstructions', []):
                for step in instruction.get('steps', []):
                    instructions.append(step['step'])
            
            results.append({
                "id": str(item['id']),
                "name": item['title'],
                "image": item['image'],
                "calories": round(cal),
                "protein": round(pro),
                "fat": round(fat),
                "carbs": round(carb),
                'image':item['image'],
                
                "serving": f"{item.get('servings', 1)} serving",
                "recipe": {
                    "description": f"Ready in {item.get('readyInMinutes')} minutes.",
                    "ingredients": ingredients,
                    "instructions": instructions,
                    "prepTime": f"{item.get('readyInMinutes')} min",
                    "cookTime": "-"
                }
            })
            
        return results
    except Exception as e:
        print(f"Spoonacular Error: {e}")
        return []
    



def recalculate_calorie_target(stats):
    """
    Mifflin-St Jeor Equation + Goal Adjustment
    """
    if stats.gender == 'male':
        bmr = (10 * stats.weight) + (6.25 * stats.height) - (5 * stats.age) + 5
    else:
        bmr = (10 * stats.weight) + (6.25 * stats.height) - (5 * stats.age) - 161

    multipliers = {
        "sedentary": 1.2,
        "light": 1.375,
        "moderate": 1.55,
        "active": 1.725
    }
    tdee = bmr * multipliers.get(stats.activity_level, 1.2)

    if stats.goal_weight:
        if stats.goal_weight < stats.weight:
            target = tdee - 500  
        elif stats.goal_weight > stats.weight:
            target = tdee + 500  
        else:
            target = tdee 
    else:
        target = tdee

    return int(target)

def log_user_weight(user_id, new_weight):
    user = User.query.get(user_id)
    if not user: return None

    new_log = WeightLog(user_id=user_id, weight=new_weight)
    db.session.add(new_log)

    stats = UserStats.query.filter_by(user_id=user_id).order_by(UserStats.updated_at.desc()).first()
    if stats:
        stats.weight = new_weight
        new_target = recalculate_calorie_target(stats)
        stats.calorie_target = new_target
    
    db.session.commit()
    return {"new_weight": new_weight, "new_target": new_target}

def predict_goal_date(user_id):
    logs = WeightLog.query.filter_by(user_id=user_id).order_by(WeightLog.date.asc()).all()
    stats = UserStats.query.filter_by(user_id=user_id).order_by(UserStats.updated_at.desc()).first()
    
    if len(logs) < 2 or not stats or not stats.goal_weight:
        return {"status": "insufficient_data", "message": "Log weight for at least 2 days to see prediction."}

    data = {'days': [], 'weight': []}
    start_date = logs[0].date
    
    for log in logs:
        days_passed = (log.date - start_date).days
        data['days'].append(days_passed)
        data['weight'].append(log.weight)

    df = pd.DataFrame(data)
    X = df[['days']]
    y = df['weight']

    model = LinearRegression()
    model.fit(X, y)
    
    slope = model.coef_[0] 
    current_weight = stats.weight
    goal = stats.goal_weight

    if slope == 0:
         return {"status": "stalled", "message": "Weight is stable."}
    
    if (goal < current_weight and slope > 0) or (goal > current_weight and slope < 0):
         return {"status": "wrong_direction", "message": "Moving away from goal."}

    days_needed = (goal - current_weight) / slope
    days_needed = abs(days_needed)
    
    predicted_date = datetime.now() + timedelta(days=days_needed)
    
    return {
        "status": "success",
        "days_needed": int(days_needed),
        "predicted_date": predicted_date.strftime("%B %d, %Y"),
        "slope": round(slope, 2)
    }