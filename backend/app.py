from flask import Flask, request, jsonify, make_response
from flask_cors import CORS
import os
from flask_login import LoginManager
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timezone
from sqlalchemy import or_

from models import db, User, MealLog, UserStats, Recipe, Ingredient, RecipeIngredient
from validators import validate_biometrics
from services import (
    fetch_nutritional_data, 
    generate_ai_recipe,
    get_recipe_with_cache, 
    format_recipe_with_servings, 
    _link_ingredient_to_recipe,
    verify_google_token, 
    search_recipes_spoonacular, 
    predict_goal_date, 
    log_user_weight
)
from ai import AIService
from analysis import PandasAnalysis
database_url = os.environ.get('DATABASE_URL')
app = Flask(__name__)

app.config['SQLALCHEMY_DATABASE_URI'] = database_url
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = ''

db.init_app(app)

CORS(app, resources={r"/*": {"origins": "*"}})

@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

login_manager = LoginManager()
login_manager.init_app(app)

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

@app.route('/')
def home():
    return "EAThiopia API is Running!"

# --- AUTH ROUTES ---

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
    
    # 1. Find by Google ID
    user = User.query.filter_by(google_id=google_id).first()

    # 2. Find by Email
    if not user:
        user = User.query.filter_by(email=email).first()
        if user:
            user.google_id = google_id
            db.session.commit()

    # 3. Create New User
    if not user:
        base_username = name
        counter = 1
        while User.query.filter_by(username=name).first():
            name = f"{base_username}{counter}"
            counter += 1

        user = User(username=name, email=email, google_id=google_id)
        db.session.add(user)
        db.session.commit()
    
    return jsonify({
        "message": "Login successful",
        "user_id": user.id,
        "username": user.username,
        "email": user.email,
        "picture": user_info.get('picture')
    }), 200

@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    email = data.get('email')

    if not username or not password:
        return jsonify({"error": "Username and password required"}), 400

    if User.query.filter_by(username=username).first():
        return jsonify({"error": "Username taken"}), 400

    hashed_pw = generate_password_hash(password)
    new_user = User(username=username, password=hashed_pw, email=email)
    
    try:
        db.session.add(new_user)
        db.session.commit()
        return jsonify({"message": "User created", "user_id": new_user.id}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    user = User.query.filter_by(username=username).first()

    if user and user.password and check_password_hash(user.password, password):
        return jsonify({
            "message": "Login successful",
            "user_id": user.id,
            "username": user.username
        }), 200
    
    return jsonify({"error": "Invalid credentials"}), 401


@app.route('/api/user/<user_id>', methods=['GET'])
def get_user_by_id(user_id):
    user = User.query.get(user_id)
    if user:
        return jsonify({
            "user_id": user.id,
            "username": user.username,
            "email": user.email
        }), 200
    return jsonify({"error": "User not found"}), 404

# --- USER STATS ---

@app.route('/api/user/<user_id>/stats', methods=['POST'])
def add_user_stats(user_id):
    try:
        uid = int(user_id)
        user = User.query.get(uid)
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        data = request.get_json()
        weight = float(data.get('weight') or 0)
        height = float(data.get('height') or 0)
        
        if weight == 0 or height == 0:
            return jsonify({"error": "Weight and Height cannot be 0"}), 400

        age = int(data.get('age') or 0)
        gender = data.get('gender', 'Male') 
        activity = data.get('activity_level', 'moderate')
        
        # Calculate Calorie Target
        calorie_target = data.get('calorie_target') or data.get('target')
        if not calorie_target:
             bmr = (10 * weight) + (6.25 * height) - (5 * age)
             bmr += 5 if gender.lower() == 'male' else -161
             activity_multipliers = {"sedentary": 1.2, "light": 1.375, "moderate": 1.55, "active": 1.725}
             multiplier = activity_multipliers.get(activity, 1.2)
             calorie_target = int(bmr * multiplier)

        target_weight = data.get('target_weight') or weight
        height_m = height / 100
        bmi = round(weight / (height_m * height_m), 2)

        existing_stats = UserStats.query.filter_by(user_id=uid).first()

        if existing_stats:
            existing_stats.weight = weight
            existing_stats.height = height
            existing_stats.age = age
            existing_stats.gender = gender
            existing_stats.activity_level = activity
            existing_stats.bmi = bmi
            existing_stats.target_weight = target_weight
            existing_stats.calorie_target = int(calorie_target) 
            existing_stats.updated_at = datetime.now()
        else:
            new_stats = UserStats(
                user_id=user.id,
                weight=weight,
                height=height,
                age=age,
                gender=gender,
                activity_level=activity,
                bmi=bmi,
                target_weight=target_weight,
                calorie_target=int(calorie_target), 
                updated_at=datetime.now()
            )
            db.session.add(new_stats)
        
        db.session.commit()
        return jsonify({"message": "Stats saved", "bmi": bmi, "calorie_goal": int(calorie_target)}), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Database error: {str(e)}"}), 500
    
@app.route('/api/user/<int:user_id>/stats', methods=['PUT'])
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
        updated_at=datetime.utcnow() 
    )
    try:
        db.session.add(new_stats)
        db.session.commit()
        return jsonify({"message": "New weight entry recorded!"}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# --- FOOD LOGGING ---

@app.route('/api/food/search/<query>/<int:user_id>', methods=['GET'])
def search_food(query, user_id):
    try:
        ing = Ingredient.query.filter(Ingredient.name.ilike(f"%{query}%")).first()
        if ing:
            recipe = ing.recipe_json
            if not recipe:
                recipe = generate_ai_recipe(ing.name)
                ing.recipe_json = recipe
                db.session.commit()
            
            # Use variables so we can return them later
            meal_name, calories, protein, fats, carbs = ing.name, ing.calories_per_unit, ing.protein_per_unit, ing.fats_per_unit, ing.carbs_per_unit

        else:
            data, status = fetch_nutritional_data(query)
            if status != 200: return jsonify({"error": "Not found"}), 404
            
            meal_name = data['meal_name']
            calories = data['calories']
            protein = data['protein']
            fats = data['fats']
            carbs = data['carbs']
            recipe = data.get('recipe')

            new_ing = Ingredient(name=meal_name, calories_per_unit=calories, protein_per_unit=protein, fats_per_unit=fats, carbs_per_unit=carbs, recipe_json=recipe)
            db.session.add(new_ing)
            db.session.commit()

        new_log = MealLog(user_id=user_id, meal_name=meal_name, protein=protein, fats=fats, carbs=carbs, calories=calories, date=datetime.now(timezone.utc))
        db.session.add(new_log)
        db.session.commit()

        return jsonify({
            "meal_name": meal_name,
            "calories": calories,
            "protein": protein, "fats": fats, "carbs": carbs,
            "recipe": recipe,
            "id": new_log.id
        }), 200
    except Exception as e:
        print(f"Search Error: {e}")
        return jsonify({"error": "Internal server error"}), 500

@app.route('/api/user/<int:user_id>/meal-log', methods=['POST'])
def log_meal(user_id):
    data = request.get_json()
    if not data.get('food_name'): return jsonify({"error": "Food name required"}), 400
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
        return jsonify({"message": "Meal logged", "id": new_meal.id}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@app.route('/api/user/<int:user_id>/meal-log', methods=['GET'])
def get_meal_log(user_id):
    meals = MealLog.query.filter_by(user_id=user_id).order_by(MealLog.date.desc()).all()
    return jsonify([{
        "id": m.id, "meal_name": m.meal_name, "protein": m.protein,
        "fats": m.fats, "carbs": m.carbs, "calories": m.calories,
        "date": m.date.strftime("%Y-%m-%d %H:%M:%S")
    } for m in meals]), 200

@app.route('/api/user/<int:user_id>/meal-log/<int:meal_id>', methods=['DELETE'])
def delete_meal_log_entry(user_id, meal_id):
    meal = MealLog.query.filter_by(id=meal_id, user_id=user_id).first()
    if not meal: return jsonify({"error": "Not found"}), 404
    db.session.delete(meal)
    db.session.commit()
    return jsonify({"message": "Deleted"}), 200

@app.route('/api/user/<int:user_id>/meal-log', methods=['DELETE'])
def delete_all_meal_logs(user_id):
    MealLog.query.filter_by(user_id=user_id).delete()
    db.session.commit()
    return jsonify({"message": "All deleted"}), 200

# --- RECIPES ---

@app.route('/api/recipes', methods=['POST'])
def create_recipe():
    data = request.get_json() 
    if Recipe.query.filter_by(food=data.get('food')).first():
        return jsonify({"error": "Recipe already exists"}), 400
    try:
        new_recipe = Recipe(food=data.get('food'), instructions=data.get('instructions'), base_servings=data.get('base_servings', 1))
        db.session.add(new_recipe)
        db.session.flush() 
        for ing in data.get('ingredients', []): _link_ingredient_to_recipe(new_recipe.id, ing)
        db.session.commit()
        return jsonify({"message": "Recipe created", "recipe_id": new_recipe.id}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@app.route('/api/recipes/<int:recipe_id>', methods=['GET'])
def get_recipe(recipe_id):
    recipe = get_recipe_with_cache(recipe_id, source=request.args.get('source', 'local'))
    if not recipe: return jsonify({"error": "Recipe not found"}), 404
    data = format_recipe_with_servings(recipe, request.args.get('servings', type=int) or recipe.base_servings)
    return jsonify(data), 200

@app.route('/api/recipes/search', methods=['GET'])
def search_recipes():
    return jsonify(search_recipes_spoonacular(request.args.get('query')) if request.args.get('query') else []), 200

# --- STATS READERS ---

@app.route('/api/user/<int:user_id>/stats/latest', methods=['GET'])
def get_user_stats(user_id):
    stats = UserStats.query.filter_by(user_id=user_id).order_by(UserStats.updated_at.desc()).first()
    if stats:
        return jsonify({
            "weight": stats.weight, "height": stats.height, "age": stats.age,
            "bmi": stats.bmi, "activity_level": stats.activity_level,
            "target": stats.calorie_target, "calorie_target": stats.calorie_target,
            "target_weight": stats.target_weight, "updated_at": stats.updated_at
        }), 200
    return jsonify({"error": "No stats found"}), 404

# --- FIX: SEPARATED THE MERGED LINES HERE ---
@app.route('/api/user/<int:user_id>/weight', methods=['POST'])
def update_weight(user_id):
    data = request.json
    result = log_user_weight(user_id, data.get('weight'))
    if result: return jsonify(result), 200
    return jsonify({"error": "User not found"}), 404

@app.route('/api/user/<int:user_id>/prediction', methods=['GET'])
def get_prediction(user_id):
    return jsonify(predict_goal_date(user_id)), 200

# --- AI ROUTES ---

@app.route('/api/ai/advice', methods=['POST'])
def get_advice():
    data = request.get_json(force=True) 
    user_id = data.get('userid') or data.get('user_id')
    if not user_id: return jsonify({"error": "User ID is missing"}), 400
    try:
        analysis = PandasAnalysis(user_id)
        response = AIService().advice(analysis.ai_input(), data.get('question'))
        return jsonify(response)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
@app.route('/init-db')
def init_db():
    try:
        db.create_all()
        return "Database tables created successfully! You can now log in."
    except Exception as e:
        return f"Error creating tables: {str(e)}"
if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(debug=True)

#COOL STUFF