from flask import Flask, request, jsonify
from models import db, User, MealLog
from flask_login import login_required, current_user
from datetime import datetime

app = Flask(__name__)

app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://rodasgeberhiwet:rodas1018@localhost:5432/eathiopia_db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

@app.route('/')
def home():
    return "EAThiopia API is Running!"

@app.route('/users')
@login_required
def get_users():
    pass

@app.route('/meallogs/', methods=['POST', 'GET'])
@login_required
def log_meal():
    data = request.get_json()
    meal_name = data.get('food') 
    if not meal_name:
        return {"error": "Meal name is required"}, 400

    local_results = MealLog.query.filter(MealLog.name.like(f"%{meal_name}%")).all()
    if local_results:
        pass

with app.app_context():
    db.create_all()

if __name__ == "__main__":
    app.run(debug=True)