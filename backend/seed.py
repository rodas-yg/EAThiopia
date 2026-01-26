# from app import app
# from models import  db, Ingredient

# def seed_ingredients():
#     initial_ingredients = [
#         {"name":"Teff Flour","calories_per_unit": 366, "protein_per_unit": 13.3, "carbs_per_unit": 73.1, "fats_per_unit": 2.4},
#         {"name":"Shiro(Chickpeas)","calories_per_unit": 164, "protein_per_unit": 8.9, "carbs_per_unit": 27.4, "fats_per_unit": 2.6},
#         {"name":"Lentils","calories_per_unit": 116, "protein_per_unit": 9.0, "carbs_per_unit": 20.1, "fats_per_unit": 0.4},
#         {"name":"Injera","calories_per_unit": 220, "protein_per_unit": 6.0, "carbs_per_unit": 45.0, "fats_per_unit": 1.0},
#         {"name":"Niter Kibbeh","calories_per_unit": 884, "protein_per_unit": 0.5, "carbs_per_unit": 0.0, "fats_per_unit": 99.0},
#         {"name":"Berbere Spice","calories_per_unit": 325, "protein_per_unit": 14.0, "carbs_per_unit": 58.0, "fats_per_unit": 10.0},
#     ]
#     with app.app_context():
#         print("Seeding ingredients...")
#         for ingredient in initial_ingredients:
#             exists = Ingredient.query.filter_by(name=ingredient["name"]).first()
#             if not exists:
#                 new_ingredient = Ingredient(
#                     name=ingredient["name"],
#                     calories_per_unit=ingredient["calories_per_unit"],
#                     protein_per_unit=ingredient["protein_per_unit"],
#                     carbs_per_unit=ingredient["carbs_per_unit"],
#                     fats_per_unit=ingredient["fats_per_unit"]
#                 )
#                 db.session.add(new_ingredient)
#         db.session.commit()
#         print("Seeding completed.")
        
# if __name__ == "__main__":
#     seed_ingredients()
