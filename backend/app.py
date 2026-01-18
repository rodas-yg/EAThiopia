from flask import Flask, request, jsonify
from models import db, User, MealLog, UserStats, Recipe, Ingredient, RecipeIngredient
from flask_login import login_required, current_user
from datetime import datetime
from validators import validate_biometrics, validate_meal_log, validate_email
from calculations import calculate_bmi, daily_caloric_needs
from services import fetch_nutritional_data, get_recipe_with_cache, format_recipe_with_servings

app = Flask(__name__)

app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://rodasgeberhiwet:rodas1018@localhost:5432/eathiopia_db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

@app.route('/')
def home():
    return "EAThiopia API is Running!"

#/**************Authentication and user profile routes***************/#


# Register or login user via Google authentication
@app.route('/api/auth/register', methods=['POST'])
def register():  # sourcery skip: use-named-expression
    """Register a new user or return an existing user based on Google authentication data.
    This endpoint validates the provided user information and creates a new user record if one does not already exist.

    Args:
        None: The request body must contain 'email', 'google_id', and 'name' fields in JSON format.

    Returns:
        Response: A JSON response indicating success or failure, including user details when appropriate.
    """
    data = request.get_json()
    email = data.get('email')
    google_id = data.get('google_id')
    name = data.get('name')
    
    if not email or not google_id or not name:
        return jsonify({"error": "Missing required fields"}), 400
    
    user = User.query.filter_by(email=email).first()
    if user:
        print(f"Welcome back, {user.username}!")
        return jsonify({
            "message": "User already exists",
            "user_id": user.id,
            "username": user.username         
                        }), 200
    
    else:
        print("Registering new user...")
        try:
            new_user = User(
                username = name,
                email = email,
                google_id = google_id
            )
            db.session.add(new_user)
            db.session.commit()
            return jsonify({
                        "message": "User registered successfully",
                        "user_id": new_user.id,
                        "username": new_user.username
                    }), 201
        except Exception as e:
            db.session.rollback()
            return jsonify({"error": str(e)}), 500

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
@app.route('/api/food/search/<query>', methods=['GET'])
@login_required
def search_food(query):
    local_result = Ingredient.query.filter(Ingredient.name.ilike(f"%{query}%")).first()
    if local_result:
        return jsonify({
            "meal_name": local_result.meal_name,
            "protein": local_result.protein,
            "fats": local_result.fats,
            "carbs": local_result.carbs,
            "calories": local_result.calories
        }), 200
    
    usda_result, status_code = fetch_nutritional_data(query)
    log_meal(current_user.id, usda_result)
    return jsonify(usda_result), status_code


#adds to users meal log
@app.route('/api/user/<int:user_id>/meal-log', methods=['POST'])
@login_required
def log_meal(user_id):
    data = request.get_json()
    errors = validate_meal_log(data)
    if errors:
        return jsonify({"errors": errors}), 400
    try:
        new_meal = MealLog(
            user_id=user_id,
            meal_name=data.get('food_name'),
            protein=data.get('protein'),
            fats=data.get('fats'),
            carbs=data.get('carbs'),
            calories=data.get('calories'),
            date=datetime.now(utc=True)
        )
        db.session.add(new_meal)
        db.session.commit()
        return jsonify({"message": "Meal logged successfully"}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

#get users meal log
@app.route('/api/user/<int:user_id>/meal-log', methods=['GET'])
@login_required
def get_meal_log(user_id):
    meals = MealLog.query.filter_by(user_id=user_id).all()
    meal_list = [{
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
@login_required
def delete_meal_log_entry(user_id, meal_id):
    meal = MealLog.query.filter_by(id=meal_id, user_id=user_id).first()
    if not meal:
        return jsonify({"error": "Meal log entry not found"}), 404
    try:
        db.session.delete(meal)
        db.session.commit()
        return jsonify({"message": "Meal log entry deleted successfully"}), 200
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
@login_required
def create_recipe():
    data = request.get_json() 
    food = data.get('food')
    ingredients = data.get('ingredients') #needs to be a list
    instructions = data.get('instructions') #list of string
    
#get recpie
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

with app.app_context():
    db.create_all()

if __name__ == "__main__":
    app.run(debug=True)