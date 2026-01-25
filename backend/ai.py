import google.generativeai as genai
import os
import json
from dotenv import load_dotenv

# 1. Force load .env so the key is definitely found
load_dotenv()
gemini_key = os.getenv("gemini_key")

if not gemini_key:
    print("ERROR: 'gemini_key' is missing from .env file!")
else:
    genai.configure(api_key=gemini_key)

class AIService:
    def __init__(self):
        try:
            self.model = genai.GenerativeModel("gemini-2.5-flash")
        except Exception as e:
            print(f"Error initializing Gemini: {e}")

    def advice(self, data: dict, question=None):
        """
        Generates advice. Returns a safe JSON dictionary even if it fails.
        """
        if not data:
            return {
                "analysis": "Error: No data provided.",
                "suggestion": "Please ensure you are logged in.",
                "encouragement": "Try again later.",
                "answer_to_question": None
            }

        username = data.get('username', 'User')
        age = data.get("age", "N/A")
        gender = data.get("gender", "N/A")
        activity_level = data.get("activity_level", "N/A")
        
        target_calories = data.get("target_calories", "N/A")
        current_weight = data.get("current_weight", "N/A")
        target_weight = data.get("target_weight", "N/A")

        meals = data.get("meals") or []
        meals_str = ", ".join(meals) if meals else "No meals logged yet"

        macros = data.get("macros") or []
        p = macros[0] if len(macros) > 0 else 0
        c = macros[1] if len(macros) > 1 else 0
        f = macros[2] if len(macros) > 2 else 0
        user_context = f"User: {username} | Age: {age} | Gender: {gender} | Activity: {activity_level}"
        history_context = f"Weight: {current_weight} -> Target: {target_weight} | Meals: {meals_str} | Macros: {p}g P, {c}g C, {f}g F"

        prompt = f"""
        You are an expert nutritionist.
        Profile: {user_context}
        Today's Log: {history_context}
        """

        if question:
            prompt += f"\nUser Question: {question}\nAnswer this specifically."

        prompt += """
        Task: Provide JSON output only.
        Format:
        {
            "analysis": "1 sentence summary.",
            "suggestion": "Specific recommendation.",
            "encouragement": "Short motivation.",
            "answer_to_question": "Answer string or null"
        }
        """

        try:
            response = self.model.generate_content(
                prompt,
                generation_config={"response_mime_type": "application/json"}
            )
            return json.loads(response.text)

        except Exception as e:
            print(f"AI GENERATION ERROR: {e}")
            return {
                "analysis": "AI Service Unavailable.",
                "suggestion": "We couldn't generate advice right now.",
                "encouragement": "Keep tracking your meals!",
                "answer_to_question": "Error connecting to AI."
            }