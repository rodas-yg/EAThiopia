from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=False, nullable=False) 
    email = db.Column(db.String(120), unique=True, nullable=True)
    password = db.Column(db.String(200), nullable=True)
    google_id = db.Column(db.String(200), unique=True, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    stats = db.relationship('UserStats', backref='user', lazy=True)
    meal_logs = db.relationship('MealLog', backref='user', lazy=True)

class UserStats(db.Model):
    __tablename__ = 'user_stats'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    age = db.Column(db.Integer, nullable=False)
    gender = db.Column(db.String(10), nullable=False)
    height = db.Column(db.Float, nullable=False)
    weight = db.Column(db.Float, nullable=False)
    
    bmi = db.Column(db.Float, nullable=True)
    
    goal_weight = db.Column(db.Float, nullable=True)
    target_weight = db.Column(db.Float, nullable=True)
    activity_level = db.Column(db.String(20), nullable=False)
    calorie_target = db.Column(db.Integer, nullable=False)
    
    updated_at = db.Column(db.DateTime, default=datetime.utcnow)

class MealLog(db.Model):
    __tablename__ = 'meal_log'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    meal_name = db.Column(db.String(100), nullable=False)
    calories = db.Column(db.Integer, nullable=False)
    protein = db.Column(db.Float, default=0)
    carbs = db.Column(db.Float, default=0)
    fats = db.Column(db.Float, default=0)
    amount = db.Column(db.Float, default=1) 
    date = db.Column(db.DateTime, default=datetime.utcnow)

class Recipe(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    instructions = db.Column(db.JSON) 
    spoonacular_id = db.Column(db.Integer, unique=True)
    base_servings = db.Column(db.Integer)
    total_calories = db.Column(db.Float)
    recipe_ingredients = db.relationship('RecipeIngredient', backref='recipe', lazy=True)

class Ingredient(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    unit = db.Column(db.String(50)) 
    calories_per_unit = db.Column(db.Float)
    protein_per_unit = db.Column(db.Float)
    carbs_per_unit = db.Column(db.Float)
    fats_per_unit = db.Column(db.Float)
    recipe_json = db.Column(db.JSON, nullable=True) 

class RecipeIngredient(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    recipe_id = db.Column(db.Integer, db.ForeignKey('recipe.id'), nullable=False)
    ingredient_id = db.Column(db.Integer, db.ForeignKey('ingredient.id'), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    ingredient = db.relationship('Ingredient')
    
class WeightLog(db.Model):
    __tablename__ = 'weight_log'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    weight = db.Column(db.Float, nullable=False)
    date = db.Column(db.DateTime, default=datetime.utcnow)