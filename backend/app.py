from flask import Flask, request, jsonify
from models import db, User, MealLog, UserStats, Recipe, Ingredient, RecipeIngredient
from flask_login import login_required, current_user
from datetime import datetime, timezone
from validators import validate_biometrics, validate_meal_log, validate_email
from calculations import calculate_bmi, daily_caloric_needs
from services import fetch_nutritional_data, get_recipe_with_cache, format_recipe_with_servings, _link_ingredient_to_recipe
from services import verify_google_token
from flask_cors import CORS
app = Flask(__name__)

app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://rodasgeberhiwet:rodas1018@localhost:5432/eathiopia_db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)
CORS(app)
@app.route('/')
def home():
    return "EAThiopia API is Running!"

#/**************Authentication and user profile routes***************/#


# Register or login user via Google authentication
@app.route('/api/auth/google', methods=['POST'])
def google_auth():
    data = request.get_json()
    token = data.get('token')
    
    if not token:
        return jsonify({"error": "Missing token"}), 400

    user_info = verify_google_token(token)
    
    if not user_info:
        return jsonify({"error": "Invalid Google Token"}), 401

    email = user_info['email']
    google_id = user_info['google_id']
    name = user_info.get('name', 'User')
    
    user = User.query.filter_by(google_id=google_id).first()

    if not user:
        print(f"Creating new user: {email}")
        user = User(
            username=name,
            email=email,
            google_id=google_id
        )
        db.session.add(user)
        db.session.commit()
    
    return jsonify({
        "message": "Login successful",
        "user_id": user.id,
        "username": user.username,
        "email": user.email,
        "picture": user_info.get('picture')
    }), 200

# Get user by ID
@app.route('/api/user/<user_id>', methods=['GET'])
@login_required
def get_user_by_id(user_id):
    user = User.query.get(user_id)
    if user:
        return jsonify({
            "user_id": user.id,
            "username": user.username,
            "email": user.email
        }), 200
    return jsonify({"error": "User not found"}), 404


# Update user profile
@app.route('/api/user/<user_id>/', methods=['POST'])
@login_required
def update_user_profile(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    
    if username:
        user.username = username
    if email:
        user.email = email
    
    try:
        db.session.commit()
        return jsonify({"message": "User profile updated successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

#adds user stats such as weight, height, age, activity level, BMI, target, and target weight.
@app.route('/api/user/<user_id>/stats', methods=['POST'])
@login_required
def add_user_stats(user_id):
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    data = request.get_json()
    weight = data.get('weight')
    weight_unit = data.get('weight_unit', 'kg')
    height = data.get('height')
    height_unit = data.get('height_unit', 'cm')
    age = data.get('age')
    activity_level = data.get('activity_level')
    try:
        bmi = calculate_bmi(weight, weight_unit, height, height_unit)
    except ValueError as ve:
        return jsonify({"error": str(ve)}), 400
    
    try:
        new_stats = UserStats(
            user_id=user.id,
            weight=weight,
            height=height,
            age=age,
            activity_level=activity_level,
            bmi=bmi,
            target=data.get('target'),
            target_weight=data.get('target_weight')
        )
        db.session.add(new_stats)
        db.session.commit()
        return jsonify({"message": "User stats added successfully"}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
    
#updates user stats such as weight, height, age, activity level, BMI, target, and target weight.
@app.route('/api/user/<int:user_id>/stats', methods=['PUT'])
@login_required
def update_user_stats(user_id):
    user = User.query.get_or_404(user_id)
    data = request.get_json()
    
    try:
        validate_biometrics(data) 
    except ValueError as ve:
        return jsonify({"error": str(ve)}), 400

    new_stats = UserStats(
        user_id=user.id,
        weight=data.get('weight'),
        weight_unit=data.get('weight_unit'),
        height=data.get('height'),
        height_unit=data.get('height_unit'),
        date=datetime.utcnow() 
    )

    try:
        db.session.add(new_stats)
        db.session.commit()
        return jsonify({"message": "New weight entry recorded!"}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
    


#*************************** Food log and tracking ***********************
# #/

#hybrid food search from either local database or USDA API
@app.route('/api/food/search/<query>/<int:user_id>', methods=['GET'])
def search_food(query, user_id):
    """Searches for food and automatically logs it to the user's history."""
    
    local_result = Ingredient.query.filter(Ingredient.name.ilike(f"%{query}%")).first()
    
    food_data = None
    if local_result:
        food_data = {
            "meal_name": local_result.name,
            "protein": local_result.protein,
            "fats": local_result.fats,
            "carbs": local_result.carbs,
            "calories": local_result.calories
        }
    else:
        usda_result, status_code = fetch_nutritional_data(query)
        if status_code == 200:
            food_data = usda_result
            
    if not food_data:
        return jsonify({"error": "Food not found"}), 404

    try:
        new_log = MealLog(
            user_id=user_id,
            meal_name=food_data['meal_name'],
            protein=food_data['protein'],
            fats=food_data['fats'],
            carbs=food_data['carbs'],
            calories=food_data['calories'],
            date=datetime.now(timezone.utc)
        )
        db.session.add(new_log)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        print(f"Logging failed: {e}")

    return jsonify(food_data), 200

#adds searched meal to meal log
@app.route('/api/user/<int:user_id>/meal-log', methods=['POST'])
def log_meal(user_id):
    data = request.get_json()
    
    # Simple validation inline to match your request style
    if not data.get('food_name'):
        return jsonify({"error": "Food name required"}), 400
        
    try:
        new_meal = MealLog(
            user_id=user_id,
            meal_name=data.get('food_name'),
            protein=data.get('protein', 0),
            fats=data.get('fats', 0),
            carbs=data.get('carbs', 0),
            calories=data.get('calories', 0),
            date=datetime.now(timezone.utc)
        )
        db.session.add(new_meal)
        db.session.commit()
        
        return jsonify({
            "message": "Meal logged successfully", 
            "id": new_meal.id 
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
#get users meal log
@app.route('/api/user/<int:user_id>/meal-log', methods=['GET'])
def get_meal_log(user_id):
    """
    Fetch all meals for the user.
    """
    meals = MealLog.query.filter_by(user_id=user_id).order_by(MealLog.date.desc()).all()
    meal_list = [{
        "id": meal.id,  
        "meal_name": meal.meal_name,
        "protein": meal.protein,
        "fats": meal.fats,
        "carbs": meal.carbs,
        "calories": meal.calories,
        "date": meal.date.strftime("%Y-%m-%d %H:%M:%S")
    } for meal in meals]
    return jsonify(meal_list), 200

#get history of meal logs
@app.route('/api/user/<int:user_id>/meal-log/history', methods=['GET'])
@login_required
def get_meal_log_history(user_id):
    meals = MealLog.query.filter_by(user_id=user_id).order_by(MealLog.date.desc()).all()
    meal_history = [{
        "meal_name": meal.meal_name,
        "protein": meal.protein,
        "fats": meal.fats,
        "carbs": meal.carbs,
        "calories": meal.calories,
        "date": meal.date.strftime("%Y-%m-%d %H:%M:%S")
    } for meal in meals]
    return jsonify(meal_history), 200

#delete a meal log entry
@app.route('/api/user/<int:user_id>/meal-log/<int:meal_id>', methods=['DELETE'])
def delete_meal_log_entry(user_id, meal_id):
    meal = MealLog.query.filter_by(id=meal_id, user_id=user_id).first()
    if not meal:
        return jsonify({"error": "Meal log entry not found"}), 404
    try:
        db.session.delete(meal)
        db.session.commit()
        return jsonify({"message": "Meal deleted"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

#delete meal a meal log
@app.route('/api/user/<int:user_id>/meal-log', methods=['DELETE'])
@login_required
def delete_meal_log(user_id):
    try:
        MealLog.query.filter_by(user_id=user_id).delete()
        db.session.commit()
        return jsonify({"message": "All meal log entries deleted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
    
#***********************Recipe Management Routes*************************/

@app.route('/api/recipes', methods=['POST'])
def create_recipe():
    data = request.get_json() 
    food = data.get('food')
    ingredients = data.get('ingredients') 
    instructions = data.get('instructions')
    
    if Recipe.query.filter_by(food=food).first():
        return jsonify({"error": "Recipe already exists"}), 400
        
    try:
        new_recipe = Recipe(
            food=food,
            instructions=instructions, 
            base_servings=data.get('base_servings', 1)
        )
        db.session.add(new_recipe)
        db.session.flush() 

        for ing_data in ingredients:
            _link_ingredient_to_recipe(new_recipe.id, ing_data)

        db.session.commit()
        return jsonify({"message": "Recipe created", "recipe_id": new_recipe.id}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

#get recipe
@app.route('/api/recipes/<int:recipe_id>', methods=['GET'])
@login_required
def get_recipe(recipe_id):
    source = request.args.get('source', 'local')
    servings = request.args.get('servings', type=int)
    recipe = get_recipe_with_cache(recipe_id, source=source)
    
    if not recipe:
        return jsonify({"error": "Recipe not found"}), 404
    if not servings:
        servings = recipe.base_servings
    data = format_recipe_with_servings(recipe, servings)
    return jsonify(data), 200

#get user stats
@app.route('/api/user/<int:user_id>/stats/latest', methods=['GET'])
def get_user_stats(user_id):
    """
    Get the user's most recent weight, height, and calorie target.
    """
    stats = UserStats.query.filter_by(user_id=user_id).order_by(UserStats.date.desc()).first()
    
    if stats:
        return jsonify({
            "weight": stats.weight,
            "height": stats.height,
            "age": stats.age,
            "bmi": stats.bmi,
            "activity_level": stats.activity_level,
            "target": stats.target,
            "calorie_target": 2000,
            "date": stats.date
        }), 200
    
    return jsonify({"error": "No stats found"}), 404

if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(debug=True)
