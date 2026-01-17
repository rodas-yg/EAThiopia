#communicates with USDA API to fetch nutritional data for food items logged by users.

import requests
import json
import os

'''
TODO: replace the api key with environment variable for better security.
'''


api_key ="lD1b7btXh3huOlJ10dXicJ2iHMZcTqUvjYZ17HN7"
base_url = "https://api.nal.usda.gov/fdc/v1/foods/search" 


def fetch_nutritional_data(food_item):
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

print(fetch_nutritional_data("Apple"))