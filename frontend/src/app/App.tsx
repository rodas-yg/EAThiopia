import { useState, useEffect } from "react";
import { GoogleOAuthProvider } from '@react-oauth/google';
import { CalorieTracker } from "./components/CalorieTracker";
import { MealLogger, MealEntry } from "./components/MealLogger";
import { EthiopianFoodDatabase, EthiopianFood } from "./components/EthiopianFoodDatabase";
import { FoodDatabaseTabs } from "./components/FoodDatabaseTabs";
import { TargetSetter } from "./components/TargetSetter";
import { MealSuggestions } from "./components/MealSuggestions";
import { Onboarding, OnboardingData } from "./components/Onboarding";
import { AuthPage } from "./components/AuthPage";
import { Statistics } from "./components/Statistics";
import { Utensils, LogOut, BarChart3, Home, Loader2 } from "lucide-react";
import { Button } from "./components/ui/button";
import { TibebPattern } from "./components/TibebPattern";
import { motion } from "motion/react";
import { Toaster, toast } from 'sonner'; // Ensure you have this installed: npm install sonner

// ⚠️ YOUR CLIENT ID
const GOOGLE_CLIENT_ID = "191012445356-023kbidcgpfvrevfavcuvgp3nieaq3v5.apps.googleusercontent.com";

type AppState = "auth" | "onboarding" | "app";
type Page = "home" | "statistics";

export default function App() {
  const [appState, setAppState] = useState<AppState>("auth");
  const [currentPage, setCurrentPage] = useState<Page>("home");
  const [loading, setLoading] = useState(true);

  // User Data
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState("User");
  const [calorieTarget, setCalorieTarget] = useState(2000);
  const [meals, setMeals] = useState<MealEntry[]>([]);

  // --- 1. INITIAL LOAD ---
  useEffect(() => {
    const initApp = async () => {
      const storedUserId = localStorage.getItem('user_id');
      const storedName = localStorage.getItem('username');

      if (storedUserId) {
        setUserId(storedUserId);
        if (storedName) setUserName(storedName);
        
        // Fetch Data in Parallel
        await Promise.all([
            fetchUserStats(storedUserId),
            fetchMeals(storedUserId)
        ]);
        
        setAppState("app");
      } else {
        setAppState("auth");
      }
      setLoading(false);
    };

    initApp();
  }, []);

  // --- 2. FETCH FUNCTIONS ---
  const fetchUserStats = async (id: string) => {
    try {
      const res = await fetch(`http://127.0.0.1:5000/api/user/${id}/stats/latest`);
      if (res.ok) {
        const data = await res.json();

        if (data.calorie_target) setCalorieTarget(data.calorie_target); 
      } else {

        if (res.status === 404) setAppState("onboarding");
      }
    } catch (err) {
      console.error("Failed to fetch stats", err);
    }
  };

  const fetchMeals = async (id: string) => {
    try {
      const res = await fetch(`http://127.0.0.1:5000/api/user/${id}/meal-log`);
      if (res.ok) {
        const data = await res.json();
        const formattedMeals = data.map((m: any) => ({
            id: m.id || Math.random().toString(), 
            foodName: m.meal_name,
            calories: m.calories,
            servings: 1, 
            timestamp: new Date(m.date)
        }));
        setMeals(formattedMeals);
      }
    } catch (err) {
      console.error("Failed to fetch meals", err);
    }
  };


  const handleAuth = (email: string) => {
    window.location.reload(); 
  };

  const handleOnboardingComplete = (data: OnboardingData) => {
    setUserName(data.name);
    setCalorieTarget(data.calorieTarget);
    setAppState('app');
    
    // Refresh page to ensure clean state
    window.location.reload();
  };

  const handleLogout = () => {
    if (confirm('Log out?')) {
      localStorage.clear();
      setAppState('auth');
      setUserId(null);
    }
  };

  const handleAddMeal = async (meal: Omit<MealEntry, 'id' | 'timestamp'>) => {
    const newMeal: MealEntry = {
      ...meal,
      id: Date.now().toString(),
      timestamp: new Date(),
    };
    setMeals([...meals, newMeal]);

    try {
        const res = await fetch(`http://127.0.0.1:5000/api/user/${userId}/meal-log`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                food_name: meal.foodName,
                calories: meal.calories,
                protein: 0, // You can add these to MealEntry interface later
                carbs: 0,
                fats: 0
            })
        });
        
        if (res.ok) {
            toast.success("Meal logged successfully!");
        } else {
            toast.error("Failed to save meal to server.");
        }
    } catch (err) {
        console.error(err);
        toast.error("Connection error.");
    }
  };

  // In src/app/App.tsx

const handleRemoveMeal = async (id: string | number) => {
    // 1. Optimistic UI Update (Remove it immediately from screen)
    const oldMeals = [...meals];
    setMeals(meals.filter(meal => meal.id !== id));

    // 2. Send Delete Request to Backend
    if (userId) {
        try {
            const res = await fetch(`http://127.0.0.1:5000/api/user/${userId}/meal-log/${id}`, {
                method: 'DELETE',
            });

            if (res.ok) {
              toast.success("Meal deleted.");
            } else {
               // Revert if failed
                toast.error("Could not delete meal.");
                 setMeals(oldMeals);
            }
        } catch (e) {
            console.error("Failed to delete meal", e);
            toast.error("Connection error.");
            setMeals(oldMeals);
        }
    }
};

  const handleAddFromDatabase = (food: EthiopianFood) => {
    handleAddMeal({
      foodName: food.name,
      calories: food.calories,
      servings: 1,
      
    });
  };

  // Calculations
  const calculateTodayCalories = () => {
    const today = new Date();
    return meals
      .filter(meal => {
        const mealDate = new Date(meal.timestamp);
        return mealDate.toDateString() === today.toDateString();
      })
      .reduce((total, meal) => total + (meal.calories * (meal.servings || 1)), 0);
  };

  const consumedCalories = calculateTodayCalories();
  const remainingCalories = calorieTarget - consumedCalories;

  // --- RENDER ---
  const renderContent = () => {
    if (loading) return (
        <div className="h-screen flex items-center justify-center bg-[#faf8f5]">
            <Loader2 className="w-10 h-10 text-[#8b5a3c] animate-spin" />
        </div>
    );

    if (appState === "auth") return <AuthPage onAuth={handleAuth} />;
    if (appState === "onboarding") return <Onboarding onComplete={handleOnboardingComplete} />;

    return (
      <div className="min-h-screen bg-[#faf8f5] relative">
        <Toaster position="top-center" />
        {/* Background Pattern */}
        <div className="fixed inset-0 opacity-20 pointer-events-none">
          <TibebPattern className="w-full h-full text-[#8b5a3c]" variant="subtle" />
        </div>

        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm border-b border-[#8b5a3c]/20 sticky top-0 z-50 relative overflow-hidden">
          <div className="absolute bottom-0 left-0 right-0 h-1">
            <TibebPattern className="w-full h-full text-[#8b5a3c]" variant="border" />
          </div>
          <div className="max-w-7xl mx-auto px-4 py-4 relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <motion.div
                  whileHover={{ rotate: 5, scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="w-12 h-12 bg-gradient-to-br from-[#8b5a3c] to-[#c89968] rounded-2xl flex items-center justify-center shadow-lg"
                >
                  <Utensils className="w-6 h-6 text-white" />
                </motion.div>
                <div>
                  <h1 className="text-2xl font-bold text-[#2d2520]">
                    EAThiopia
                  </h1>
                  <p className="text-xs text-[#786f66]">Welcome, {userName}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Navigation */}
                <div className="flex gap-2 mr-3">
                  <Button
                    variant={currentPage === "home" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setCurrentPage("home")}
                    className={currentPage === "home" ? "bg-[#8b5a3c] hover:bg-[#6b4423]" : "hover:bg-[#8b5a3c]/10"}
                  >
                    <Home className="w-4 h-4 mr-2" />
                    Home
                  </Button>
                  <Button
                    variant={currentPage === "statistics" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setCurrentPage("statistics")}
                    className={currentPage === "statistics" ? "bg-[#8b5a3c] hover:bg-[#6b4423]" : "hover:bg-[#8b5a3c]/10"}
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Statistics
                  </Button>
                </div>

                <TargetSetter
                  currentTarget={calorieTarget}
                  onUpdateTarget={setCalorieTarget}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="hover:bg-[#8b5a3c]/10"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 py-8 relative z-10">
          {currentPage === "home" ? (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column */}
                <div className="lg:col-span-2 space-y-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                  >
                    <CalorieTracker
                      consumed={consumedCalories}
                      target={calorieTarget}
                      remaining={remainingCalories}
                    />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                  >
                    <MealLogger
                      meals={meals}
                      onAddMeal={handleAddMeal}
                      onRemoveMeal={handleRemoveMeal}
                    />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                  >
                    <MealSuggestions
                      remainingCalories={remainingCalories}
                      consumedCalories={consumedCalories}
                      onAddSuggestion={handleAddFromDatabase}
                    />
                  </motion.div>
                </div>

                {/* Right Column */}
                <motion.div
                  className="lg:col-span-1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.4 }}
                >
                  <FoodDatabaseTabs onAddFood={handleAddFromDatabase} />
                </motion.div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="statistics"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Statistics meals={meals} calorieTarget={calorieTarget} />
            </motion.div>
          )}
        </div>
      </div>
    );
  };

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      {renderContent()}
    </GoogleOAuthProvider>
  );
}