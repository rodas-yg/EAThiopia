import { useState, useEffect } from "react";
import { GoogleOAuthProvider } from '@react-oauth/google';
import { CalorieTracker } from "./components/CalorieTracker";
import { MealLogger, MealEntry } from "./components/MealLogger";
import { EthiopianFoodDatabase } from "./components/EthiopianFoodDatabase";
import { MealSuggestions } from "./components/MealSuggestions";
import { Onboarding, OnboardingData } from "./components/Onboarding";
import { AuthPage } from "./components/AuthPage";
import { Statistics } from "./components/Statistics";
import { FoodWithRecipe } from "./components/FoodDetailsModal"; 

import { Utensils, LogOut, BarChart3, Home, Loader2 } from "lucide-react";
import { Button } from "./components/ui/button";
import { TibebPattern } from "./components/TibebPattern";
import { Toaster, toast } from 'sonner';

const GOOGLE_CLIENT_ID = "191012445356-023kbidcgpfvrevfavcuvgp3nieaq3v5.apps.googleusercontent.com";

type AppState = "auth" | "onboarding" | "app";
type Page = "home" | "statistics";

export default function App() {
  const [appState, setAppState] = useState<AppState>("auth");
  const [currentPage, setCurrentPage] = useState<Page>("home");
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState("User");
  const [calorieTarget, setCalorieTarget] = useState(2000);
  const [meals, setMeals] = useState<MealEntry[]>([]);

  // --- STRICT LOGIN LOGIC ---
  useEffect(() => {
    const initApp = async () => {
      const storedUserId = localStorage.getItem('user_id');
      
      // If no ID, go straight to login
      if (!storedUserId || storedUserId === "undefined") {
        console.log("No user ID found, redirecting to Auth.");
        handleLogout(); 
        setLoading(false);
        return;
      }

      setUserId(storedUserId);
      const storedName = localStorage.getItem('username');
      if (storedName) setUserName(storedName);
      
      // Verify User Exists in Backend
      try {
        const res = await fetch(`http://127.0.0.1:5000/api/user/${storedUserId}/stats/latest`);
        
        if (res.ok) {
            // Success: User exists and has stats -> Go to Dashboard
            const data = await res.json();
            if (data.calorie_target) setCalorieTarget(data.calorie_target);
            await fetchMeals(storedUserId);
            setAppState("app");
        } else if (res.status === 404) {
            // 404 usually means "User found, but no stats".
            // BUT since you dropped tables, it might mean "User doesn't exist at all".
            // Let's check if the USER exists first.
            const userRes = await fetch(`http://127.0.0.1:5000/api/user/${storedUserId}`);
            
            if (userRes.ok) {
                // User exists, just needs onboarding
                setAppState("onboarding");
            } else {
                // User ID is invalid (deleted from DB) -> FORCE LOGOUT
                console.log("User ID invalid (deleted from DB). Logging out...");
                localStorage.clear();
                setAppState("auth");
            }
        } else {
            // Server Error -> Force Logout to be safe
            setAppState("auth");
        }
      } catch (err) {
        console.error("Connection failed:", err);
        setAppState("auth");
      }
      setLoading(false);
    };

    initApp();
  }, []);

  const fetchMeals = async (id: string) => {
    try {
      const res = await fetch(`http://127.0.0.1:5000/api/user/${id}/meal-log`);
      if (res.ok) {
        const data = await res.json();
        setMeals(data.map((m: any) => ({
            id: m.id,
            foodName: m.meal_name,
            calories: m.calories,
            servings: 1, 
            timestamp: new Date(m.date),
            protein: m.protein,
            carbs: m.carbs,
            fats: m.fats
        })));
      }
    } catch (err) { console.error(err); }
  };

  const handleAuth = () => window.location.reload();
  
  const handleOnboardingComplete = (data: OnboardingData) => {
    setUserName(data.name);
    setCalorieTarget(data.calorieTarget);
    setAppState('app');
  };

  const handleLogout = () => {
    localStorage.clear();
    setUserId(null);
    setAppState('auth');
  };

  const handleAddMeal = async (meal: Omit<MealEntry, 'id' | 'timestamp'>) => {
    const tempId = "temp-" + Date.now();
    const newMeal: MealEntry = { ...meal, id: tempId, timestamp: new Date(), protein: meal.protein||0, carbs: meal.carbs||0, fats: meal.fats||0 };
    setMeals(prev => [...prev, newMeal]);

    if(userId) {
        try {
            const res = await fetch(`http://127.0.0.1:5000/api/user/${userId}/meal-log`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    food_name: meal.foodName, calories: meal.calories, amount: meal.servings,
                    protein: meal.protein||0, carbs: meal.carbs||0, fats: meal.fats||0
                })
            });
            if (res.ok) {
                const data = await res.json();
                toast.success("Meal logged!");
                if (data.id) setMeals(prev => prev.map(m => m.id === tempId ? { ...m, id: data.id } : m));
            } else {
                toast.error("Failed to save.");
                setMeals(prev => prev.filter(m => m.id !== tempId));
            }
        } catch (err) {
            toast.error("Connection error.");
            setMeals(prev => prev.filter(m => m.id !== tempId));
        }
    }
  };

  const handleApiSearch = async (query: string) => {
    if (!userId) return;
    try {
        const toastId = toast.loading(`Searching for "${query}"...`);
        const res = await fetch(`http://127.0.0.1:5000/api/food/search/${query}/${userId}`);
        if (res.ok) {
            const data = await res.json();
            toast.dismiss(toastId);
            toast.success(`Found: ${data.meal_name}`);
            fetchMeals(userId);
        } else {
            toast.dismiss(toastId);
            toast.error("Not found.");
        }
    } catch (e) { toast.error("Search failed."); }
  };

  const handleRemoveMeal = async (id: string | number) => {
    setMeals(meals.filter(meal => meal.id !== id));
    if (userId) await fetch(`http://127.0.0.1:5000/api/user/${userId}/meal-log/${id}`, { method: 'DELETE' });
  };

  const handleAddFromDatabase = (food: FoodWithRecipe) => {
    handleAddMeal({
      foodName: food.name, calories: food.calories, servings: 1,
      protein: food.protein, carbs: food.carbs, fats: food.fat
    });
  };

  const consumed = meals.reduce((acc, m) => acc + (m.calories * m.servings), 0);

  const renderContent = () => {
    if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin w-10 h-10 text-[#8b5a3c]" /></div>;
    
    if (appState === "auth") return <AuthPage onAuth={handleAuth} />;
    
    if (appState === "onboarding") return <Onboarding onComplete={handleOnboardingComplete} />;

    return (
      <div className="min-h-screen bg-[#faf8f5] relative">
        <Toaster position="top-center" />
        <div className="fixed inset-0 opacity-20 pointer-events-none">
          <TibebPattern className="w-full h-full text-[#8b5a3c]" variant="subtle" />
        </div>

        <div className="bg-white/80 backdrop-blur-sm border-b border-[#8b5a3c]/20 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#8b5a3c] rounded-xl flex items-center justify-center text-white">
                    <Utensils className="w-6 h-6" />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-[#2d2520]">EAThiopia</h1>
                    <p className="text-xs text-[#786f66]">Welcome, {userName}</p>
                </div>
             </div>
             
             <div className="flex gap-2">
                <Button 
                    variant={currentPage === "home" ? "default" : "ghost"} 
                    onClick={() => setCurrentPage("home")}
                    className={currentPage === "home" ? "bg-[#8b5a3c] hover:bg-[#6b4423]" : ""}
                >
                    <Home className="w-4 h-4 mr-2" /> Home
                </Button>
                <Button 
                    variant={currentPage === "statistics" ? "default" : "ghost"} 
                    onClick={() => setCurrentPage("statistics")}
                    className={currentPage === "statistics" ? "bg-[#8b5a3c] hover:bg-[#6b4423]" : ""}
                >
                    <BarChart3 className="w-4 h-4 mr-2" /> Statistics
                </Button>
                <Button variant="ghost" onClick={() => {
                    if(confirm("Log out?")) handleLogout();
                }}><LogOut className="w-4 h-4" /></Button>
             </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8 relative z-10">
          {currentPage === "home" ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <CalorieTracker consumed={consumed} target={calorieTarget} remaining={calorieTarget - consumed} />
                <MealLogger meals={meals} onAddMeal={handleAddMeal} onRemoveMeal={handleRemoveMeal} />
                <MealSuggestions 
                    remainingCalories={calorieTarget - consumed} 
                    consumedCalories={consumed} 
                    onAddSuggestion={handleAddFromDatabase} 
                    userId={userId || ""} 
                />
              </div>
              
              <div className="lg:col-span-1 h-full min-h-[500px]">
                 <EthiopianFoodDatabase 
                    onAddFood={handleAddFromDatabase} 
                    onApiSearch={handleApiSearch} 
                 />
              </div>
            </div>
          ) : (
            <Statistics meals={meals} calorieTarget={calorieTarget} />
          )}
        </div>
      </div>
    );
  };

  return <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>{renderContent()}</GoogleOAuthProvider>;
}