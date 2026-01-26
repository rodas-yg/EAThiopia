"""
Handles data integrity and checks for user biometrics and food logging.
"""

def validate_biometrics(data):
    """
    Validates the dictionary of biometric data usually sent via POST /api/user/stats.
    Expected keys: weight, weight_unit, height, height_unit, age, gender, activity_level, target
    """
    errors = []
    
    weight = data.get('weight')
    weight_unit = data.get('weight_unit', 'kg')
    height = data.get('height')
    height_unit = data.get('height_unit', 'cm')
    height_inches = data.get('height_inches', 0)
    age = data.get('age')
    gender = data.get('gender')
    activity_level = data.get('activity_level')
    target = data.get('target')

    required_fields = [weight, height, age, gender, activity_level, target]
    if any(field is None for field in required_fields):
        errors.append("All biometric fields (weight, height, age, gender, activity, target) are required.")
        return errors 
    
    
    check_weight = weight if weight_unit == 'lbs' else weight * 2.204
    if weight <= 0:
        errors.append("Weight must be a positive number.")
    elif check_weight > 1000:
        errors.append("Weight exceeds realistic human limits (1000 lbs).")


    if height_unit == 'ft':
        check_height_cm = ((height * 12) + height_inches) * 2.54
    elif height_unit == 'm':
        check_height_cm = height * 100
    else:
        check_height_cm = height

    if check_height_cm < 50:
        errors.append("Height seems too low (minimum 50cm).")
    elif check_height_cm > 275:
        errors.append("Height exceeds realistic human limits (275cm).")

    if not (13 <= age <= 120):
        errors.append("Age must be between 13 and 120.")

    valid_activities = ['sedentary', 'light', 'moderate', 'active', 'extra_active']
    if activity_level.lower() not in valid_activities:
        errors.append(f"Invalid activity level. Choose from: {', '.join(valid_activities)}")

    valid_targets = ['lose', 'maintain', 'gain']
    if target.lower() not in valid_targets:
        errors.append(f"Invalid target. Choose from: {', '.join(valid_targets)}")

    return errors

def validate_meal_log(data):
    """
    Validates data for logging a meal.
    """
    errors = []
    food_name = data.get('food_name')
    amount = data.get('amount')

    if not food_name or len(food_name) < 2:
        errors.append("A valid food name is required.")
    
    if amount is None:
        errors.append("Serving size (amount) is required.")
    elif amount <= 0:
        errors.append("Serving size (amount) must be greater than zero.")
    elif amount > 5000: 
        errors.append("Serving size seems unrealistically large.")

    return errors

def validate_email(email):
    """
    Simple check to ensure email has an @ and a dot.
    """
    return [] if "@" in email and "." in email else ["Invalid email format."]