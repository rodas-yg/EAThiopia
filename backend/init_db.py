from app import app, db
from models import User, UserStats, WeightLog, MealLog

with app.app_context():
    print("Creating database tables...")
    db.create_all()
    print("Tables created successfully!")