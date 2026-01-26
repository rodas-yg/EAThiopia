from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_login import LoginManager
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timezone
from sqlalchemy import or_
from models import db, User, MealLog, UserStats, Recipe, Ingredient, RecipeIngredient
from validators import validate_biometrics
from services import (
    fetch_nutritional_data, 
    get_recipe_with_cache, 
    format_recipe_with_servings, 
    _link_ingredient_to_recipe,
    verify_google_token, 
    search_recipes_spoonacular, 
    predict_goal_date, 
    log_user_weight,generate_ai_recipe
)
from ai import AIService
from analysis import PandasAnalysis

app = Flask(__name__)

app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://rodasgeberhiwet:rodas1018@localhost:5432/eathiopia_db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = 'abc123'

db.init_app(app)

CORS(app, resources={r"/*": {"origins": "http://localhost:5173"}}, supports_credentials=True)

login_manager = LoginManager()
login_manager.init_app(app)

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

@app.route('/')
def home():
    return "EAThiopia API is Running!"


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
    
    # 1. Try to find user by Google ID
    user = User.query.filter_by(google_id=google_id).first()

    # 2. If not found, try to find by Email (Link existing account)
    if not user:
        user = User.query.filter_by(email=email).first()
        if user:
            user.google_id = google_id
            db.session.commit()

    # 3. If still not found, check if Username is taken
    if not user:
        # Check if "Rodas Geberhiwet" exists. If so, change name to "Rodas Geberhiwet1"
        base_username = name
        counter = 1
        while User.query.filter_by(username=name).first():
            name = f"{base_username}{counter}"
            counter += 1

        print(f"Creating new user: {name}")
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
        age = int(data.get('age') or 0)
        gender = data.get('gender', 'Male') 
        activity = data.get('activity_level', 'moderate')
        
        # 1. Get or Calculate Calorie Target
        calorie_target = data.get('calorie_target') or data.get('target')

        if not calorie_target:
             # Mifflin-St Jeor Equation
             bmr = (10 * weight) + (6.25 * height) - (5 * age)
             bmr += 5 if gender.lower() == 'male' else -161
             
             activity_multipliers = {
                 "sedentary": 1.2, "light": 1.375, "moderate": 1.55, "active": 1.725
             }
             multiplier = activity_multipliers.get(activity, 1.2)
             calorie_target = int(bmr * multiplier)

        target_weight = data.get('target_weight')
        if target_weight is None:
            target_weight = weight
            
        if weight == 0 or height == 0:
            return jsonify({"error": "Weight and Height cannot be 0"}), 400

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
        
        return jsonify({
            "message": "Stats saved successfully", 
            "bmi": bmi,
            "calorie_goal": int(calorie_target)
        }), 201

    except Exception as e:
        db.session.rollback()
        print(f"CRITICAL DB ERROR: {e}")
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
        # FIX: Use updated_at instead of date
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
        # 1. Check local "Learned" Database
        ing = Ingredient.query.filter(Ingredient.name.ilike(f"%{query}%")).first()
        
        if ing:
            meal_name, calories, protein, fats, carbs = ing.name, ing.calories_per_unit, ing.protein_per_unit, ing.fats_per_unit, ing.carbs_per_unit
            recipe = ing.recipe_json
            if not recipe:
                recipe = generate_ai_recipe(meal_name)
                ing.recipe_json = recipe
                db.session.commit()
        else:
            # 2. Fetch Fresh Data (USDA + AI Recipe)
            data, status = fetch_nutritional_data(query)
            if status != 200: return jsonify({"error": "Not found"}), 404
            
            meal_name, calories, protein, fats, carbs = data['meal_name'], data['calories'], data['protein'], data['fats'], data['carbs']
            recipe = data.get('recipe')

            # Cache in DB
            new_ing = Ingredient(name=meal_name, calories_per_unit=calories, protein_per_unit=protein, fats_per_unit=fats, carbs_per_unit=carbs, recipe_json=recipe)
            db.session.add(new_ing)
            db.session.commit()

        # 3. Log to Daily History
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

@app.route('/api/user/<int:user_id>/meal-log', methods=['GET'])
def get_meal_log(user_id):
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

@app.route('/api/user/<int:user_id>/meal-log', methods=['DELETE'])
def delete_all_meal_logs(user_id):
    try:
        MealLog.query.filter_by(user_id=user_id).delete()
        db.session.commit()
        return jsonify({"message": "All meal log entries deleted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
    
# --- RECIPES ---

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

@app.route('/api/recipes/<int:recipe_id>', methods=['GET'])
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

@app.route('/api/recipes/search', methods=['GET'])
def search_recipes():
    query = request.args.get('query')
    if not query: return jsonify([]), 200
    
    results = search_recipes_spoonacular(query)
    return jsonify(results), 200

@app.route('/api/user/<int:user_id>/stats/latest', methods=['GET'])
def get_user_stats(user_id):
    stats = UserStats.query.filter_by(user_id=user_id).order_by(UserStats.updated_at.desc()).first()
    
    if stats:
        return jsonify({
            "weight": stats.weight,
            "height": stats.height,
            "age": stats.age,
            "bmi": stats.bmi,
            "activity_level": stats.activity_level,
            "target": stats.calorie_target, 
            "calorie_target": stats.calorie_target,
            "target_weight": stats.target_weight,
            "updated_at": stats.updated_at
        }), 200
    
    return jsonify({"error": "No stats found"}), 404
@app.route('/api/user/<int:user_id>/weight', methods=['POST'])
def update_weight(user_id):
    data = request.json
    new_weight = data.get('weight')
    
    result = log_user_weight(user_id, new_weight)
    if result:
        return jsonify(result), 200
    return jsonify({"error": "User not found"}), 404

@app.route('/api/user/<int:user_id>/prediction', methods=['GET'])
def get_prediction(user_id):
    result = predict_goal_date(user_id)
    return jsonify(result), 200

# --- AI ROUTES ---

@app.route('/api/ai/advice', methods=['POST'])
def get_advice():
    data = request.get_json(force=True) 
    
    user_id = data.get('userid') or data.get('user_id')
    question = data.get('question')

    if not user_id:
        return jsonify({"error": "User ID is missing"}), 400

    ai_service = AIService()

    try:
        analysis = PandasAnalysis(user_id)
        analyzed_data = analysis.ai_input()
        
        response = ai_service.advice(analyzed_data, question)

        if response is None:
            return jsonify({
                "error": "AI generation failed.",
                "details": "The AI service returned no data."
            }), 500

        return jsonify(response)

    except Exception as e:
        print(f"Server Error in get_advice: {e}")
        return jsonify({"error": f"Internal Server Error: {str(e)}"}), 500

if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(debug=True)