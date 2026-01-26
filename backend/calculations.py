def calculate_bmi(weight,weight_unit, height, height_unit, height_inches=0):
    """
    Calculate Body Mass Index (BMI) using weight and height.
    Args:
        weight (float): Weight of the user in kilograms.
        weight_unit (str): Unit of weight ('kg' or 'lbs').
        height (float): Height of the user in meters.
        height_unit (str): Unit of height ('cm', or 'inches').
    Returns:
        Calculated BMI value.
    """

    
    if is_height_valid and is_weight_valid:
        if weight_unit == 'lbs':
            weight = weight * 0.453592  
        if height_unit == 'cm':
            height = height / 100  
        elif height_unit == 'inches':
            total_height_inches = height + height_inches
            height = total_height_inches * 0.0254  
        bmi = weight / (height ** 2)
        return round(bmi, 2)
    else:
        raise ValueError("Invalid weight or height values.")

def daily_caloric_needs(weight, weight_unit, height, height_unit, age, activity_level, goal):
    if is_weight_valid(weight, weight_unit) and is_height_valid(height, height_unit):
        if weight_unit == 'lbs':
            weight = weight * 0.453592  
        if height_unit == 'cm':
            height = height / 100
        elif height_unit == 'inches':
            height = height * 0.0254  

        bmr = 10 * weight + 6.25 * height - 5 * age + 5  # Mifflin-St Jeor for men
        if activity_level == 'sedentary':
            caloric_needs = bmr * 1.2
        elif activity_level == 'light':
            caloric_needs = bmr * 1.375
        elif activity_level == 'moderate':
            caloric_needs = bmr * 1.55
        elif activity_level == 'active':
            caloric_needs = bmr * 1.725
        elif activity_level == 'very_active':
            caloric_needs = bmr * 1.9

        if goal == 'lose_weight':
            caloric_needs -= 500 
        elif goal == 'gain_weight':
            caloric_needs += 500 

        return round(caloric_needs, 2)
    else:
        raise ValueError("Invalid weight, height, age, or activity level.")

def calculate_macros():
    pass

def is_weight_valid(weight, unit):
    if unit == 'kg':
        return weight > 0 and weight < 635  
    elif unit == 'lbs':
        return weight > 0 and weight < 1400
    return False


def is_height_valid(height, unit):
    if unit == 'cm':
        return height > 0 and height < 250
    elif unit == 'inches':
        return height > 0 and height < 100
    return False