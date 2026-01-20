import google.generativeai as genai
import os

gemini_key = os.getenv("gemini_key")
genai.configure(api_key=gemini_key)
class AIService:
    def __init__(self):
        self.model = genai.GenerativeModel("gemini-1.5-flash")
    
    def advice(self, username, history:dict, question=None):
        
        history_context  = f"""
        Target Calories:{history.get('target_calories', 'N/A')}
        current weight:  {history.get('current_weight', 'N/A')}
        target weight:   {history.get('target_weight', 'N/A')}
        meals eaten:{", ".join(history.get('meals', [])) if history.get('meals') else 'N/A'}
        statistics:{history.get('statistics', 'N/A')} 
        
        """
        
        #statistics is just consumed protein (for now)
        
