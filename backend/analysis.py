import pandas as pd
import numpy as np
from datetime import datetime
from models import MealLog, UserStats, db, User

class PandasAnalysis:
    def __init__(self, user_id):
        self.user_id = user_id
        self.stats_df = pd.DataFrame()
        self.meals_df = pd.DataFrame()
        self.combined_df = pd.DataFrame()

    def fetch_user_data(self):
        """Fetch the user's logged meals and load them into a dataframe.

        This prepares meal data with normalized dates for downstream analysis and aggregation.

        Returns:
            pd.DataFrame: A dataframe containing the user's meal logs, or an empty dataframe if no meals are found.
        """
        meals = MealLog.query.filter_by(user_id=self.user_id).all()
        
        if not meals:
            return pd.DataFrame()
        
        data = [{
            "date": m.date,
            'meal_name': m.meal_name,
            'calories': float(m.calories),
            'protein': float(m.protein),
            'carbs': float(m.carbs),
            "fats": float(m.fats)
        } for m in meals]
        
        self.meals_df = pd.DataFrame(data)
        
        self.meals_df['date'] = pd.to_datetime(self.meals_df['date'])
        self.meals_df['date_only'] = self.meals_df['date'].dt.normalize()
        

    def fetch_user_stats(self):
        stats = UserStats.query.filter_by(user_id=self.user_id).all()
        if not stats:
            return pd.DataFrame()
        
        data = [{
            'weight': float(s.weight),
            'height': float(s.height),
            'activity_level': str(s.activity_level),
            'bmi': float(s.bmi) if s.bmi else 0,
            'target_weight': float(s.target_weight) if s.target_weight else float(s.weight),
            'gender': s.gender,
            'date': s.updated_at  
        } for s in stats]
        
        self.stats_df = pd.DataFrame(data)
        
        self.stats_df['date'] = pd.to_datetime(self.stats_df['date'])
        self.stats_df['date_only'] = self.stats_df['date'].dt.normalize()
        
    
    def join_dfs(self):
        """Combine the user's meal and stats data into a single dataframe.

        This aligns daily nutrient intake with available body metrics to support downstream reporting and analysis.
        
        Returns:
            pd.DataFrame or None: The combined dataframe of daily intake and stats, or None if no meal data is available.
        """

        if self.meals_df.empty:
            return None

        daily_intake = self.meals_df.groupby('date_only')[['calories', 'protein', 'carbs', 'fats']].sum().reset_index()
        
        if self.stats_df.empty:
            self.combined_df = daily_intake
        else:
            self.combined_df = pd.merge(
                daily_intake, 
                self.stats_df[['date_only', 'weight', 'activity_level', 'bmi', 'gender', 'height']], 
                on='date_only', 
                how='outer'
            )

    def ai_input(self):
        """
        Returns the dictionary exactly as required by the AI Service.
        """
        self.fetch_user_data()
        self.fetch_user_stats()
        self.join_dfs()
        
        latest_stats = {}
        if not self.stats_df.empty:
            latest_stats = self.stats_df.sort_values('date').iloc[-1].to_dict()

        todays_meals = []
        todays_macros = [0, 0, 0] 
        
        if not self.meals_df.empty:
            today = pd.Timestamp.now().normalize()
            today_df = self.meals_df[self.meals_df['date_only'] == today]
            
            if not today_df.empty:
                todays_meals = today_df['meal_name'].tolist()
                todays_macros = [
                    round(today_df['protein'].sum()),
                    round(today_df['carbs'].sum()),
                    round(today_df['fats'].sum())
                ]
        
        user = User.query.filter_by(id=self.user_id).first()
        
        return {
            "username": user.username if user else "User",
            "age": latest_stats.get('age', "N/A"),
            "gender": latest_stats.get('gender', "N/A"),
            "activity_level": latest_stats.get('activity_level', "N/A"),
            "current_weight": latest_stats.get('weight', "N/A"),
            "target_weight": latest_stats.get('target_weight', "N/A"),
            "meals": todays_meals,
            "macros": todays_macros
        }