import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { RefreshCw, Plus, Sparkles } from "lucide-react";
import { EthiopianFood } from "./EthiopianFoodDatabase";
import { motion } from "motion/react";
import { TibebPattern } from "./TibebPattern";
import { AISuggestionModal } from "./AISuggestionModal";

interface MealSuggestionsProps {
  remainingCalories: number;
  consumedCalories: number;
  onAddSuggestion: (food: EthiopianFood) => void;
}

const ETHIOPIAN_FOODS: EthiopianFood[] = [
  {
    id: "1",
    name: "Injera with Doro Wat",
    nameAmharic: "እንጀራ ከዶሮ ወጥ ጋር",
    calories: 450,
    protein: 28,
    carbs: 52,
    fat: 12,
    serving: "1 plate (300g)",
    image: "https://images.unsplash.com/flagged/photo-1572644973628-e9be84915d59?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
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
    image: "https://images.unsplash.com/photo-1647998270792-69ac80570183?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
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
    image: "https://images.unsplash.com/photo-1765338915553-6e02fe63ff4f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
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
    image: "https://images.unsplash.com/photo-1596235502219-a1c80d8be60c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
  },
  {
    id: "5",
    name: "Beyainatu (Vegetarian Combo)",
    nameAmharic: "በያይነቱ",
    calories: 350,
    protein: 12,
    carbs: 62,
    fat: 6,
    serving: "1 plate (400g)",
    image: "https://images.unsplash.com/photo-1633980990916-74317cba1ea3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
  },
  {
    id: "6",
    name: "Gomen (Collard Greens)",
    nameAmharic: "ጎመን",
    calories: 120,
    protein: 6,
    carbs: 18,
    fat: 3,
    serving: "1 cup (150g)",
    image: "https://images.unsplash.com/photo-1633980990916-74317cba1ea3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
  },
  {
    id: "7",
    name: "Misir Wat (Red Lentils)",
    nameAmharic: "ምስር ወጥ",
    calories: 240,
    protein: 16,
    carbs: 36,
    fat: 4,
    serving: "1 cup (200g)",
    image: "https://images.unsplash.com/photo-1596235502219-a1c80d8be60c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
  },
  {
    id: "8",
    name: "Injera (Plain)",
    nameAmharic: "እንጀራ",
    calories: 170,
    protein: 6,
    carbs: 34,
    fat: 1,
    serving: "1 large piece",
    image: "https://images.unsplash.com/photo-1765338915553-6e02fe63ff4f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
  },
  {
    id: "9",
    name: "Firfir",
    nameAmharic: "ፍርፍር",
    calories: 310,
    protein: 18,
    carbs: 42,
    fat: 8,
    serving: "1 plate (250g)",
    image: "https://images.unsplash.com/photo-1765338915553-6e02fe63ff4f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
  },
  {
    id: "10",
    name: "Ful (Fava Bean Stew)",
    nameAmharic: "ፉል",
    calories: 220,
    protein: 12,
    carbs: 32,
    fat: 5,
    serving: "1 bowl (200g)",
    image: "https://images.unsplash.com/photo-1596235502219-a1c80d8be60c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
  },
];

export function MealSuggestions({ remainingCalories, consumedCalories, onAddSuggestion }: MealSuggestionsProps) {
  const [seed, setSeed] = useState(0);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);

  const getSuggestions = () => {
    // Filter foods that fit within remaining calories (with some buffer)
    const suitableFoods = ETHIOPIAN_FOODS.filter(
      food => food.calories <= remainingCalories + 100
    );

    if (suitableFoods.length === 0) {
      return ETHIOPIAN_FOODS.slice(0, 3);
    }

    // Pseudo-random selection based on seed
    const shuffled = [...suitableFoods].sort((a, b) => {
      const hashA = (parseInt(a.id) * (seed + 1)) % 100;
      const hashB = (parseInt(b.id) * (seed + 1)) % 100;
      return hashA - hashB;
    });

    return shuffled.slice(0, 3);
  };

  const suggestions = getSuggestions();

  const refreshSuggestions = () => {
    setSeed(prev => prev + 1);
  };

  return (
    <>
      <Card className="w-full border-[#8b5a3c]/20 shadow-lg relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <TibebPattern className="w-full h-full text-[#8b5a3c]" />
        </div>
        <CardHeader className="relative border-b border-[#8b5a3c]/10">
          <div className="absolute bottom-0 left-0 right-0 h-2">
            <TibebPattern className="w-full h-full text-[#8b5a3c]" variant="border" />
          </div>
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-[#2d2520]">Meal Suggestions</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={refreshSuggestions}
                className="hover:bg-[#8b5a3c]/10"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
            <Button
              onClick={() => setIsAIModalOpen(true)}
              className="w-full bg-gradient-to-r from-[#8b5a3c] to-[#c89968] hover:from-[#6b4423] hover:to-[#a67850] text-white"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Get AI-Powered Suggestions
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-6 relative">
          <p className="text-sm text-[#786f66] mb-4">
            Based on your remaining {remainingCalories} calories
          </p>
          <div className="space-y-3">
            {suggestions.map((food, index) => (
              <motion.div
                key={`${food.id}-${seed}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className="p-4 border-2 border-[#8b5a3c]/20 rounded-lg hover:border-[#8b5a3c] transition-colors bg-[#faf8f5]"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-[#2d2520]">{food.name}</p>
                    <p className="text-sm text-[#786f66]">{food.nameAmharic}</p>
                    <div className="flex gap-3 mt-2 text-xs text-[#786f66]">
                      <span className="font-semibold text-[#8b5a3c]">{food.calories} cal</span>
                      <span>P: {food.protein}g</span>
                      <span>C: {food.carbs}g</span>
                      <span>F: {food.fat}g</span>
                    </div>
                    <p className="text-xs text-[#786f66] mt-1">{food.serving}</p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => onAddSuggestion(food)}
                    className="ml-4 bg-[#8b5a3c] hover:bg-[#6b4423]"
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
      />
    </>
  );
}