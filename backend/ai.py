import google.generativeai as genai
import os
import json
gemini_key = os.getenv("gemini_key")
genai.configure(api_key=gemini_key)
class AIService:
    def __init__(self):
        self.model = genai.GenerativeModel("gemini-1.5-flash")
    
    def advice(self, username, data: dict, question=None):
        """
        `data` should contain both userstats and history keys merged together.
        Expected keys (optional): age, gender, activity_level,
                                  target_calories, current_weight, target_weight,
                                  meals (list), macros (list of [protein, carbs, fats])
        """
        age = data.get("age", "N/A")
        gender = data.get("gender", "N/A")
        activity_level = data.get("activity_level", "N/A")

        target_calories = data.get("target_calories", "N/A")
        current_weight = data.get("current_weight", "N/A")
        target_weight = data.get("target_weight", "N/A")

        meals = data.get("meals") or []
        meals_str = ", ".join(meals) if meals else "N/A"

        macros = data.get("macros") or []
        protein = f"{macros[0]}g" if len(macros) > 0 else "N/A"
        carbs = f"{macros[1]}g" if len(macros) > 1 else "N/A"
        fats = f"{macros[2]}g" if len(macros) > 2 else "N/A"

        user_context = f"""
        User: {username}
        Age: {age}
        Gender: {gender}
        Activity Level: {activity_level}
        """

        history_context = f"""
        Target Calories: {target_calories}
        current weight:  {current_weight}
        target weight:   {target_weight}
        meals eaten: {meals_str}
        macros: User has consumed {protein} protein, {carbs} carbs, {fats} fats.
        """

        prompt = """
        You are a helpful and friendly nutrition assistant. Based on the user's context and history, provide personalized dietary advice.
        Make sure to encourage healthy eating habits and provide actionable suggestions.
        Here is the user's context:
        """ + user_context + """
        Here is the user's recent history:
        """ + history_context + """
        """
        
        if question:
            prompt += f" Also, answer their question: {question}"
        prompt += """Task:
        Analyze the user's nutrition data and provide personalized advice.
        
        Required JSON Output Format:
        {{
            "analysis": "A 1-sentence summary of their day so far (e.g., 'You are low on protein').",
            "suggestion": "A specific food recommendation or habit change.",
            "encouragement": "A short motivational message.",
            "answer_to_question": "Answer to the user's specific question (if provided, otherwise null)."
        }}
        """
        try:
            response = self.model.generate_content(
                prompt=prompt,
                generation_config={"response_mime_type": "application/json"})
            return json.loads(response.text)
        except Exception as e:
            print(f"Error generating advice: {e}")
            return None