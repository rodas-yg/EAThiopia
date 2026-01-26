import { useState, useEffect } from "react";
import { GoogleOAuthProvider } from '@react-oauth/google';
import { CalorieTracker } from "./components/CalorieTracker";
import { MealLogger, MealEntry } from "./components/MealLogger";
import { EthiopianFoodDatabase } from "./components/EthiopianFoodDatabase";
import { MealSuggestions } from "./components/MealSuggestions";
import { Onboarding, OnboardingData } from "./components/Onboarding";
import { AuthPage } from "./components/AuthPage";
import { Statistics } from "./components/Statistics";
import { FoodWithRecipe, FoodDetailsModal } from "./components/FoodDetailsModal"; 

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
  
  // User Data
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState("User");
  const [userPicture, setUserPicture] = useState<string | null>(null);

  const [calorieTarget, setCalorieTarget] = useState(2000);
  const [meals, setMeals] = useState<MealEntry[]>([]);
  
  // Search & Modal State
  const [sidebarSearchResults, setSidebarSearchResults] = useState<FoodWithRecipe[]>([]);
  const [selectedFood, setSelectedFood] = useState<FoodWithRecipe | null>(null); 

  useEffect(() => {
    const initApp = async () => {
      const storedUserId = localStorage.getItem('user_id');
      
      if (!storedUserId || storedUserId === "undefined") {
        handleLogout(); 
        setLoading(false);
        return;
      }

      setUserId(storedUserId);
      const storedName = localStorage.getItem('username');
      const storedPic = localStorage.getItem('user_picture');
      
      if (storedName) setUserName(storedName);
      if (storedPic) setUserPicture(storedPic);

      try {
        const res = await fetch(`http://127.0.0.1:5000/api/user/${storedUserId}/stats/latest`);
        if (res.ok) {
            const data = await res.json();
            if (data.calorie_target) setCalorieTarget(data.calorie_target);
            await fetchMeals(storedUserId);
            setAppState("app");
        } else if (res.status === 404) {
            const userRes = await fetch(`http://127.0.0.1:5000/api/user/${storedUserId}`);
            if (userRes.ok) setAppState("onboarding");
            else handleLogout();
        } else {
            setAppState("auth");
        }
      } catch (err) {
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
    if (!userId || !query.trim()) return;
    
    try {
        const toastId = toast.loading(`Searching for "${query}"...`);
        const res = await fetch(`http://127.0.0.1:5000/api/food/search/${query}/${userId}`);
        
        if (res.ok) {
            const data = await res.json();
            toast.dismiss(toastId);
            toast.success(`Found: ${data.meal_name}`);
            
            // --- SMART DATA MAPPING ---
            // If 'recipe' is missing, check 'instructions' (common in external APIs)
            const recipeData = data.recipe || data.instructions || "";

            const newResult: FoodWithRecipe = {
                name: data.meal_name,
                calories: data.calories,
                protein: data.protein,
                carbs: data.carbs,
                fat: data.fats,
                description: data.description || "Search Result",
                image: data.image,
                recipe: recipeData, 
                ingredients: data.ingredients
            };

            setSidebarSearchResults(prev => [newResult, ...prev]);
        } else {
            toast.dismiss(toastId);
            toast.error("Food not found.");
        }
    } catch (e) { 
        toast.error("Search failed."); 
    }
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
    setSelectedFood(null); // Close modal
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

        {/* DETAILS MODAL */}
        <FoodDetailsModal 
            food={selectedFood} 
            isOpen={!!selectedFood} 
            onClose={() => setSelectedFood(null)} 
            onAddFood={handleAddFromDatabase} 
        />

        <div className="bg-white/80 backdrop-blur-sm border-b border-[#8b5a3c]/20 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
             <div className="flex items-center gap-3">
                {userPicture ? (
                    <img src={userPicture} alt="Profile" className="w-10 h-10 rounded-xl object-cover border-2 border-[#8b5a3c]" />
                ) : (
                    <div className="w-10 h-10 bg-[#8b5a3c] rounded-xl flex items-center justify-center text-white">
                        <Utensils className="w-6 h-6" />
                    </div>
                )}
                <div>
                    <h1 className="text-xl font-bold text-[#2d2520]">EAThiopia</h1>
                    <p className="text-xs text-[#786f66]">Welcome, {userName}</p>
                </div>
             </div>
             
             <div className="flex gap-2">
                <Button variant={currentPage === "home" ? "default" : "ghost"} onClick={() => setCurrentPage("home")} className={currentPage === "home" ? "bg-[#8b5a3c] hover:bg-[#6b4423]" : ""}>
                    <Home className="w-4 h-4 mr-2" /> Home
                </Button>
                <Button variant={currentPage === "statistics" ? "default" : "ghost"} onClick={() => setCurrentPage("statistics")} className={currentPage === "statistics" ? "bg-[#8b5a3c] hover:bg-[#6b4423]" : ""}>
                    <BarChart3 className="w-4 h-4 mr-2" /> Statistics
                </Button>
                <Button variant="ghost" onClick={() => { if(confirm("Log out?")) handleLogout(); }}><LogOut className="w-4 h-4" /></Button>
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
                    onViewRecipe={(food) => setSelectedFood(food)} 
                    onApiSearch={handleApiSearch} 
                    searchResults={sidebarSearchResults}
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