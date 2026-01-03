import { useState, useEffect } from "react";
import { CalorieTracker } from "./components/CalorieTracker";
import { MealLogger, MealEntry } from "./components/MealLogger";
import { EthiopianFoodDatabase, EthiopianFood } from "./components/EthiopianFoodDatabase";
import { FoodDatabaseTabs } from "./components/FoodDatabaseTabs";
import { TargetSetter } from "./components/TargetSetter";
import { MealSuggestions } from "./components/MealSuggestions";
import { Onboarding, OnboardingData } from "./components/Onboarding";
import { AuthPage } from "./components/AuthPage";
import { Statistics } from "./components/Statistics";
import { Utensils, LogOut, BarChart3, Home } from "lucide-react";
import { Button } from "./components/ui/button";
import { TibebPattern } from "./components/TibebPattern";
import { motion } from "motion/react";

type AppState = "auth" | "onboarding" | "app";
type Page = "home" | "statistics";

export default function App() {
  const [appState, setAppState] = useState<AppState>(() => {
    const hasAuth = localStorage.getItem('userEmail');
    const hasOnboarding = localStorage.getItem('onboardingComplete');
    if (!hasAuth) return "auth";
    if (!hasOnboarding) return "onboarding";
    return "app";
  });

  const [currentPage, setCurrentPage] = useState<Page>("home");
  const [userEmail, setUserEmail] = useState(() => localStorage.getItem('userEmail') || '');

  const [calorieTarget, setCalorieTarget] = useState(() => {
    const saved = localStorage.getItem('calorieTarget');
    return saved ? Number(saved) : 2000;
  });

  const [meals, setMeals] = useState<MealEntry[]>(() => {
    const saved = localStorage.getItem('meals');
    return saved ? JSON.parse(saved).map((meal: any) => ({
      ...meal,
      timestamp: new Date(meal.timestamp)
    })) : [];
  });

  const [userName, setUserName] = useState(() => localStorage.getItem('userName') || 'User');

  useEffect(() => {
    localStorage.setItem('calorieTarget', calorieTarget.toString());
  }, [calorieTarget]);

  useEffect(() => {
    localStorage.setItem('meals', JSON.stringify(meals));
  }, [meals]);

  const handleAuth = (email: string) => {
    setUserEmail(email);
    localStorage.setItem('userEmail', email);
    setAppState('onboarding');
  };

  const handleOnboardingComplete = (data: OnboardingData) => {
    setUserName(data.name);
    setCalorieTarget(data.calorieTarget);
    localStorage.setItem('userName', data.name);
    localStorage.setItem('onboardingComplete', 'true');
    localStorage.setItem('onboardingData', JSON.stringify(data));
    setAppState('app');
  };

  const handleLogout = () => {
    if (confirm('Are you sure you want to log out? Your data will be preserved.')) {
      localStorage.removeItem('userEmail');
      setAppState('auth');
    }
  };

  const calculateTodayCalories = () => {
    const today = new Date();
    return meals
      .filter(meal => {
        const mealDate = new Date(meal.timestamp);
        return mealDate.toDateString() === today.toDateString();
      })
      .reduce((total, meal) => total + (meal.calories * meal.servings), 0);
  };

  const consumedCalories = calculateTodayCalories();
  const remainingCalories = calorieTarget - consumedCalories;

  const handleAddMeal = (meal: Omit<MealEntry, 'id' | 'timestamp'>) => {
    const newMeal: MealEntry = {
      ...meal,
      id: Date.now().toString(),
      timestamp: new Date(),
    };
    setMeals([...meals, newMeal]);
  };

  const handleRemoveMeal = (id: string) => {
    setMeals(meals.filter(meal => meal.id !== id));
  };

  const handleAddFromDatabase = (food: EthiopianFood) => {
    handleAddMeal({
      foodName: food.name,
      calories: food.calories,
      servings: 1,
    });
  };

  if (appState === "auth") {
    return <AuthPage onAuth={handleAuth} />;
  }

  if (appState === "onboarding") {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="min-h-screen bg-[#faf8f5] relative">
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
}