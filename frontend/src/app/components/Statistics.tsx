import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { MealEntry } from "./MealLogger";
import { Activity, Target, TrendingUp, Calendar } from "lucide-react";

// --- DYNAMIC URL ---
const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000";

interface StatisticsProps {
  meals: MealEntry[];
  calorieTarget: number;
}

export function Statistics({ meals, calorieTarget }: StatisticsProps) {
  const [prediction, setPrediction] = useState<any>(null);

  // FETCH PREDICTION ON LOAD
  useEffect(() => {
    const userId = localStorage.getItem('user_id');
    if (userId) {
        // --- UPDATED URL ---
        fetch(`${API_URL}/api/user/${userId}/prediction`)
            .then(res => res.json())
            .then(data => setPrediction(data))
            .catch(err => console.error(err));
    }
  }, []);

  // --- THE FIX IS HERE ---
  // We add '|| 0' to ensure we never multiply 'undefined'
  const totalCalories = meals.reduce((acc, m) => acc + (m.calories * m.servings), 0);
  const totalProtein = meals.reduce((acc, m) => acc + ((m.protein || 0) * m.servings), 0);
  const totalCarbs = meals.reduce((acc, m) => acc + ((m.carbs || 0) * m.servings), 0);
  const totalFat = meals.reduce((acc, m) => acc + ((m.fats || 0) * m.servings), 0);
  // ----------------------

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#2d2520]">Your Progress</h2>

      {/* AI PREDICTION CARD */}
      <Card className="bg-gradient-to-br from-[#8b5a3c] to-[#6b4423] text-white border-none shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-medium opacity-90 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" /> AI Weight Prediction
            </CardTitle>
            <Calendar className="w-5 h-5 opacity-75" />
        </CardHeader>
        <CardContent>
            {prediction ? (
                prediction.status === "success" ? (
                    <div>
                        <div className="text-4xl font-bold mb-1">{prediction.predicted_date}</div>
                        <p className="text-sm opacity-80">
                            Estimated date to reach goal based on your current trend of losing 
                            <span className="font-bold"> {Math.abs(prediction.slope)} lbs/day</span>.
                        </p>
                    </div>
                ) : (
                    <div className="text-sm opacity-90 italic">
                        {prediction.message} (Log weight for at least 2 days to activate)
                    </div>
                )
            ) : (
                <div className="text-sm">Loading AI prediction...</div>
            )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Calories</CardTitle>
            <Activity className="w-4 h-4 text-[#8b5a3c]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(totalCalories)}</div>
            <p className="text-xs text-gray-500">Target: {calorieTarget}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Protein</CardTitle>
            <Target className="w-4 h-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(totalProtein)}g</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Carbs</CardTitle>
            <Target className="w-4 h-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(totalCarbs)}g</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Fat</CardTitle>
            <Target className="w-4 h-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(totalFat)}g</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}