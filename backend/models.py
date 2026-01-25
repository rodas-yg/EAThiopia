from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=False, nullable=False)
    google_id = db.Column(db.String(200), unique=True, nullable=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=True) 
    

    calorie_goal = db.Column(db.Integer, default=2000, nullable=True) 
    

    meal_logs = db.relationship('MealLog', backref='user', cascade="all, delete-orphan")
    stats = db.relationship('UserStats', backref='user', cascade="all, delete-orphan")

class MealLog(db.Model):
    __tablename__ = 'meal_logs'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    meal_name = db.Column(db.String(100), nullable=False)
    calories = db.Column(db.Integer, nullable=False)
    protein = db.Column(db.Float, default=0.0)
    carbs = db.Column(db.Float, default=0.0)
    fats = db.Column(db.Float, default=0.0)
    

    date = db.Column(db.DateTime, default=datetime.utcnow)

class UserStats(db.Model):
    __tablename__ = 'user_stats'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    weight = db.Column(db.Float, nullable=False)
    height = db.Column(db.Float, nullable=False)
    age = db.Column(db.Integer, nullable=False)

    gender = db.Column(db.String(20), nullable=False, default="Male") 
    
    
    activity_level = db.Column(db.String(50), nullable=False)
    bmi = db.Column(db.Float, nullable=False)
    target_weight = db.Column(db.Float, nullable=False)

    date = db.Column(db.DateTime, default=datetime.utcnow)


class Recipe(db.Model):
    __tablename__ = 'recipes'
    id = db.Column(db.Integer, primary_key=True)
    food = db.Column(db.String(100), nullable=False)
    instructions = db.Column(db.Text, nullable=True)
    
    image_url = db.Column(db.String(500), nullable=True) 
    spoonacular_id = db.Column(db.Integer, unique=True, nullable=True)
    base_servings = db.Column(db.Integer, default=1)
    
    ingredients = db.relationship('RecipeIngredient', backref='recipe', lazy=True)

class Ingredient(db.Model):
    __tablename__ = 'ingredients'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, unique=True)
    unit = db.Column(db.String(20), nullable=True)
    
    calories_per_unit = db.Column(db.Float, nullable=False)
    protein_per_unit = db.Column(db.Float, nullable=False)
    carbs_per_unit = db.Column(db.Float, nullable=False)
    fats_per_unit = db.Column(db.Float, nullable=False)

class RecipeIngredient(db.Model):
    __tablename__ = 'recipe_ingredients'
    recipe_id = db.Column(db.Integer, db.ForeignKey('recipes.id'), primary_key=True)
    ingredient_id = db.Column(db.Integer, db.ForeignKey('ingredients.id'), primary_key=True)
    amount = db.Column(db.Float, nullable=False) 
    unit = db.Column(db.String(20))