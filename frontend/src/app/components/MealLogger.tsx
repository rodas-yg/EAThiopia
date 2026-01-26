import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Plus, X, Search, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { TibebPattern } from "./TibebPattern";
import { FoodDetailsModal, FoodWithRecipe } from "./FoodDetailsModal";

export interface MealEntry {
  id: string | number;
  foodName: string;
  calories: number;
  servings: number;
  timestamp: Date;
  protein?: number;
  carbs?: number;
  fats?: number;
}

interface MealLoggerProps {
  meals: MealEntry[];
  onAddMeal: (meal: Omit<MealEntry, 'id' | 'timestamp'>) => void;
  onRemoveMeal: (id: string | number) => void;
}

export function MealLogger({ meals, onAddMeal, onRemoveMeal }: MealLoggerProps) {
  const [open, setOpen] = useState(false);
  
  // Search States
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<FoodWithRecipe[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  // Selection States
  const [selectedFood, setSelectedFood] = useState<FoodWithRecipe | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Debounced Search Effect
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm.length > 2) {
        performSearch(searchTerm);
      } else {
        setSearchResults([]);
      }
    }, 500); // Wait 500ms after typing

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const performSearch = async (query: string) => {
    setIsSearching(true);
    try {
      // Use the Recipe Search endpoint (Does NOT auto-log)
      const res = await fetch(`http://127.0.0.1:5000/api/recipes/search?query=${query}`);
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data);
      }
    } catch (error) {
      console.error("Search failed", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleFoodClick = (food: FoodWithRecipe) => {
    setSelectedFood(food);
    setIsDetailOpen(true);
  };

  const handleConfirmAdd = (food: FoodWithRecipe) => {

    onAddMeal({
      foodName: food.name,
      calories: food.calories,
      servings: 1, // Default to 1 serving
      protein: food.protein,
      carbs: food.carbs,
      fats: food.fat,
    });
    
    // Reset and close everything
    setSearchTerm("");
    setSearchResults([]);
    setIsDetailOpen(false);
    setOpen(false);
  };

  // Filter today's meals for the list display
  const todayMeals = meals.filter(meal => {
    const today = new Date();
    const mealDate = new Date(meal.timestamp);
    return mealDate.toDateString() === today.toDateString();
  });

  return (
    <Card className="w-full border-[#8b5a3c]/20 shadow-lg relative overflow-hidden">
      <div className="absolute inset-0 opacity-5">
        <TibebPattern className="w-full h-full text-[#8b5a3c]" />
      </div>
      
      <CardHeader className="flex flex-row items-center justify-between relative border-b border-[#8b5a3c]/10">
        <div className="absolute bottom-0 left-0 right-0 h-2">
          <TibebPattern className="w-full h-full text-[#8b5a3c]" variant="border" />
        </div>
        <CardTitle className="text-[#2d2520]">Today's Meals</CardTitle>
        
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-[#8b5a3c] hover:bg-[#6b4423]">
              <Plus className="w-4 h-4 mr-2" />
              Add Meal
            </Button>
          </DialogTrigger>
          <DialogContent className="border-[#8b5a3c]/20 sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="text-[#2d2520]">Log a Meal</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4 pt-4">
              <div className="relative">
                <Label htmlFor="search">Search Food</Label>
                <div className="relative mt-1.5">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <Input
                    id="search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Type to search (e.g. Pasta, Doro Wat)..."
                    className="pl-9 border-[#8b5a3c]/20 focus:border-[#8b5a3c] bg-[#f5f1ec]"
                    autoComplete="off"
                  />
                  {isSearching && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Loader2 className="w-4 h-4 animate-spin text-[#8b5a3c]" />
                    </div>
                  )}
                </div>
              </div>

              {/* Search Results List */}
              <div className="max-h-[300px] overflow-y-auto space-y-2">
                {searchTerm.length > 2 && searchResults.length === 0 && !isSearching && (
                   <p className="text-center text-sm text-gray-500 py-4">No results found.</p>
                )}
                
                {searchResults.map((food) => (
                  <div 
                    key={food.id}
                    onClick={() => handleFoodClick(food)}
                    className="flex items-center gap-3 p-3 rounded-lg border border-transparent hover:border-[#8b5a3c]/20 hover:bg-[#f5f1ec] cursor-pointer transition-all"
                  >
                    <div className="w-12 h-12 rounded-md bg-gray-200 overflow-hidden flex-shrink-0">
                       <img src={food.image} alt={food.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-[#2d2520]">{food.name}</p>
                      <p className="text-xs text-[#786f66]">
                        {food.calories} cal · {food.protein}g Protein
                      </p>
                    </div>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-[#8b5a3c]">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>

      <CardContent className="pt-6 relative">
        {todayMeals.length === 0 ? (
          <p className="text-center text-[#786f66] py-8">No meals logged today</p>
        ) : (
          <AnimatePresence>
            <div className="space-y-2">
              {todayMeals.map((meal, index) => (
                <motion.div
                  key={meal.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  className="flex items-center justify-between p-3 bg-[#f5f1ec] rounded-lg border border-[#8b5a3c]/10"
                >
                  <div className="flex-1">
                    <p className="text-[#2d2520]">{meal.foodName}</p>
                    <p className="text-sm text-[#786f66]">
                      {meal.servings} serving{meal.servings !== 1 ? 's' : ''} · {Math.round(meal.calories * meal.servings)} cal
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveMeal(meal.id)}
                    className="hover:bg-[#8b5a3c]/10"
                  >
                    <X className="w-4 h-4 text-[#786f66]" />
                  </Button>
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        )}
      </CardContent>

      {/* The Sidebar / Modal for Details */}
      <FoodDetailsModal 
        food={selectedFood}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onAddFood={handleConfirmAdd} 
      />
    </Card>
  );
}