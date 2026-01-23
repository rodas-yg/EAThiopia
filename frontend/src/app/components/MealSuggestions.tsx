import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { RefreshCw, Plus, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { TibebPattern } from "./TibebPattern";
import { AISuggestionModal } from "./AISuggestionModal";
import { FoodWithRecipe } from "./FoodDetailsModal"; // Correct import

interface MealSuggestionsProps {
  remainingCalories: number;
  consumedCalories: number;
  onAddSuggestion: (food: FoodWithRecipe) => void;
  userId: string; // Required prop
}

const ETHIOPIAN_FOODS: FoodWithRecipe[] = [
  {
    id: "1",
    name: "Injera with Doro Wat",
    nameAmharic: "እንጀራ ከዶሮ ወጥ ጋር",
    calories: 450,
    protein: 28,
    carbs: 52,
    fat: 12,
    serving: "1 plate (300g)",
    image: "https://images.unsplash.com/flagged/photo-1572644973628-e9be84915d59?w=400&q=80",
    recipe: { description: "Spicy chicken stew.", ingredients: [], instructions: [] }
  },
  {
    id: "2",
    name: "Kitfo",
    nameAmharic: "ክትፎ",
    calories: 380,
    protein: 32,
    carbs: 8,
    fat: 24,
    serving: "1 serving (200g)",
    image: "https://images.unsplash.com/photo-1647998270792-69ac80570183?w=400&q=80",
    recipe: { description: "Minced beef.", ingredients: [], instructions: [] }
  },
  {
    id: "3",
    name: "Tibs",
    nameAmharic: "ጥብስ",
    calories: 320,
    protein: 26,
    carbs: 12,
    fat: 18,
    serving: "1 serving (250g)",
    image: "https://images.unsplash.com/photo-1765338915553-6e02fe63ff4f?w=400&q=80",
    recipe: { description: "Sautéed meat.", ingredients: [], instructions: [] }
  },
  {
    id: "4",
    name: "Shiro Wat",
    nameAmharic: "ሽሮ ወጥ",
    calories: 280,
    protein: 14,
    carbs: 38,
    fat: 8,
    serving: "1 cup (200g)",
    image: "https://images.unsplash.com/photo-1596235502219-a1c80d8be60c?w=400&q=80",
    recipe: { description: "Chickpea stew.", ingredients: [], instructions: [] }
  }
];

export function MealSuggestions({ 
  remainingCalories, 
  consumedCalories, 
  onAddSuggestion, 
  userId 
}: MealSuggestionsProps) {
  
  const [seed, setSeed] = useState(0);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);

  const getSuggestions = () => {
    const suitableFoods = ETHIOPIAN_FOODS.filter(
      food => food.calories <= remainingCalories + 150
    );

    const pool = suitableFoods.length > 0 
      ? suitableFoods 
      : ETHIOPIAN_FOODS.sort((a,b) => a.calories - b.calories).slice(0, 3);

    const shuffled = [...pool].sort((a, b) => {
      const hashA = (parseInt(a.id) * (seed + 1)) % 100;
      const hashB = (parseInt(b.id) * (seed + 1)) % 100;
      return hashA - hashB;
    });

    return shuffled.slice(0, 3);
  };

  const suggestions = getSuggestions();
  const refreshSuggestions = () => setSeed(prev => prev + 1);

  return (
    <>
      <Card className="w-full border-[#8b5a3c]/20 shadow-lg relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <TibebPattern className="w-full h-full text-[#8b5a3c]" />
        </div>
        
        <CardHeader className="relative border-b border-[#8b5a3c]/10">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-[#2d2520] flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#8b5a3c]" />
                Meal Suggestions
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={refreshSuggestions}
                className="hover:bg-[#8b5a3c]/10 text-[#8b5a3c]"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
            
            <Button
              onClick={() => setIsAIModalOpen(true)}
              className="w-full bg-gradient-to-r from-[#8b5a3c] to-[#c89968] hover:from-[#6b4423] hover:to-[#a67850] text-white shadow-md transition-all"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Ask AI Nutritionist
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="pt-6 relative">
          <div className="space-y-3">
            {suggestions.map((food, index) => (
              <motion.div
                key={`${food.id}-${seed}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="p-3 border border-[#8b5a3c]/20 rounded-xl bg-white/50 hover:bg-white hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                            <div>
                                <h4 className="font-bold text-[#2d2520] text-sm truncate">{food.name}</h4>
                                <p className="text-xs text-[#8b5a3c]">{food.nameAmharic}</p>
                            </div>
                        </div>
                        <div className="flex gap-2 mt-1 text-xs text-[#786f66]">
                            <span className="font-bold text-[#8b5a3c]">{food.calories} cal</span>
                        </div>
                    </div>
                    
                    <Button
                        size="icon"
                        variant="secondary"
                        onClick={() => onAddSuggestion(food)}
                        className="h-8 w-8 bg-[#8b5a3c]/10 text-[#8b5a3c] hover:bg-[#8b5a3c] hover:text-white shrink-0"
                    >
                        <Plus className="w-4 h-4" />
                    </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      <AISuggestionModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        remainingCalories={remainingCalories}
        consumedCalories={consumedCalories}
        userId={userId} // Connection passed!
      />
    </>
  );
}