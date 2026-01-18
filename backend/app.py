from flask import Flask, request, jsonify
from models import db, User, MealLog, UserStats, Recipe, Ingredient, RecipeIngredient
from flask_login import login_required, current_user
from datetime import datetime
from validators import validate_biometrics, validate_meal_log, validate_email
import requests
from calculations import calculate_bmi, daily_caloric_needs

app = Flask(__name__)

app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://rodasgeberhiwet:rodas1018@localhost:5432/eathiopia_db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

def login_required(f):
    def decorated_function(*args, **kwargs):
        return f(*args, **kwargs)
    return decorated_function   

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
@app.route('/api/user/<int:user_id>/stats', methods=['POST']) # Use POST for new history entries
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
    
with app.app_context():
    db.create_all()

if __name__ == "__main__":
    app.run(debug=True)