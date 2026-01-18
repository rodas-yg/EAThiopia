from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    google_id = db.Column(db.String(200), unique=True, nullable=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=True)
    meal_logs = db.relationship('MealLog', backref='user', )
    
class MealLog(db.Model):
    __tablename__ = 'meal_logs'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    meal_name = db.Column(db.String(100), nullable=False)
    calories = db.Column(db.Integer, nullable=False)
    protein = db.Column(db.Float, nullable=False)
    carbs = db.Column(db.Float, nullable=False)
    fats = db.Column(db.Float, nullable=False)
    date = db.Column(db.DateTime, default=datetime.utcnow)



class UserStats(db.Model):
    __tablename__ = 'user_stats'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    weight = db.Column(db.Float, nullable=False)
    height = db.Column(db.Float, nullable=False)
    age = db.Column(db.Integer, nullable=False)
    activity_level = db.Column(db.String(50), nullable=False)
    bmi = db.Column(db.Float, nullable=False)
    target = db.Column(db.String(100), nullable=False)
    target_weight = db.Column(db.Float, nullable=False)
    date = db.Column(db.DateTime, default=datetime.utcnow)
    
class RecipeIngredient(db.Model):
    __tablename__ = 'recipe_ingredients'
    recipe_id = db.Column(db.Integer, db.ForeignKey('recipes.id'), primary_key=True)
    ingredient_id = db.Column(db.Integer, db.ForeignKey('ingredients.id'), primary_key=True)
    amount = db.Column(db.Float, nullable=False) 
    unit = db.Column(db.String(20))
    
class Recipe(db.Model):
    __tablename__ = 'recipes'
    id = db.Column(db.Integer, primary_key=True)
    food = db.Column(db.String(100), nullable=False)
    instructions = db.Column(db.Text, nullable=False)
    spoonacular_id = db.Column(db.Integer, unique=True, nullable=True)
    ingredients = db.relationship('RecipeIngredient', backref='recipe', lazy=True)
    base_servings = db.Column(db.Integer, default=1)

class Ingredient(db.Model):
    __tablename__ = 'ingredients'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    unit = db.Column(db.String(20), nullable=True)
    calories_per_unit = db.Column(db.Float, nullable=False)
    protein_per_unit = db.Column(db.Float, nullable=False)
    carbs_per_unit = db.Column(db.Float, nullable=False)
    fats_per_unit = db.Column(db.Float, nullable=False)
    
    def __repr__(self):
        return f'<User {self.username}>'


