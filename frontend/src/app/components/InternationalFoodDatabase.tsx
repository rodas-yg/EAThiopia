import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Search, Plus, Loader2, UtensilsCrossed } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { TibebPattern } from "./TibebPattern";
import { FoodDetailsModal, FoodWithRecipe } from "./FoodDetailsModal";

// Reusing your interface structure
export interface InternationalFood extends FoodWithRecipe {
  cuisine?: string;
}

interface InternationalFoodDatabaseProps {
  onAddFood: (food: InternationalFood) => void;
}

export function InternationalFoodDatabase({ onAddFood }: InternationalFoodDatabaseProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [foods, setFoods] = useState<InternationalFood[]>([]);
  const [selectedFood, setSelectedFood] = useState<InternationalFood | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Debounced Search Effect
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm.length > 2) {
        fetchRecipes(searchTerm);
      }
    }, 800); // Wait 800ms after typing stops

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const fetchRecipes = async (query: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`http://127.0.0.1:5000/api/recipes/search?query=${query}`);
      if (res.ok) {
        const data = await res.json();
        setFoods(data);
      }
    } catch (error) {
      console.error("Failed to fetch recipes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFoodClick = (food: InternationalFood) => {
    setSelectedFood(food);
    setIsModalOpen(true);
  };

  return (
    <>
      <Card className="w-full border-[#8b5a3c]/20 shadow-lg relative overflow-hidden h-[800px] flex flex-col">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <TibebPattern className="w-full h-full text-[#8b5a3c]" />
        </div>

        <CardHeader className="relative border-b border-[#8b5a3c]/10 shrink-0 bg-white/80 backdrop-blur-sm z-10">
          <div className="flex items-center justify-between mb-4">
            <CardTitle className="text-[#2d2520] flex items-center gap-2">
              <UtensilsCrossed className="w-5 h-5 text-[#8b5a3c]" />
              International Cuisine
            </CardTitle>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#786f66]" />
            <Input
              placeholder="Search recipes (e.g. 'Pasta', 'Tacos')..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-[#8b5a3c]/20 focus:border-[#8b5a3c] bg-[#f5f1ec]/50"
            />
            {isLoading && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <Loader2 className="w-4 h-4 text-[#8b5a3c] animate-spin" />
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {foods.length === 0 && !isLoading ? (
            <div className="flex flex-col items-center justify-center h-full text-[#786f66] opacity-60">
              <UtensilsCrossed className="w-12 h-12 mb-2" />
              <p>Search for a dish to see recipes</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AnimatePresence>
                {foods.map((food, index) => (
                  <motion.div
                    key={food.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    whileHover={{ scale: 1.02 }}
                    className="group relative overflow-hidden rounded-xl border border-[#8b5a3c]/10 bg-white shadow-sm hover:shadow-md transition-all cursor-pointer"
                    onClick={() => handleFoodClick(food)}
                  >
                    {/* Image Section */}
                    <div className="relative h-40 overflow-hidden">
                      <img
                        src={food.image}
                        alt={food.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                      
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <h3 className="text-white font-bold text-lg leading-tight truncate">
                          {food.name}
                        </h3>
                        <p className="text-white/80 text-xs mt-1 line-clamp-1">
                          {food.recipe.ingredients.length} ingredients • {food.recipe.prepTime}
                        </p>
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="p-3">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-lg font-bold text-[#8b5a3c]">
                          {food.calories} <span className="text-xs font-normal text-[#786f66]">cal</span>
                        </span>
                        
                        {/* 'Quick View' Button (Visual only, triggers card click) */}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 text-[#8b5a3c] hover:bg-[#8b5a3c]/10"
                        >
                           View Recipe
                        </Button>
                      </div>

                      {/* Macros Grid */}
                      <div className="grid grid-cols-3 gap-2 py-2 border-t border-[#8b5a3c]/10">
                        <div className="text-center">
                          <span className="block text-xs font-bold text-[#2d2520]">{food.protein}g</span>
                          <span className="text-[10px] text-[#786f66] uppercase">Protein</span>
                        </div>
                        <div className="text-center border-l border-[#8b5a3c]/10">
                          <span className="block text-xs font-bold text-[#2d2520]">{food.carbs}g</span>
                          <span className="text-[10px] text-[#786f66] uppercase">Carbs</span>
                        </div>
                        <div className="text-center border-l border-[#8b5a3c]/10">
                          <span className="block text-xs font-bold text-[#2d2520]">{food.fat}g</span>
                          <span className="text-[10px] text-[#786f66] uppercase">Fat</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Details Modal - Handles Adding to Log */}
      <FoodDetailsModal
        food={selectedFood}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddFood={onAddFood} // Pass the add function here
      />
    </>
  );
}