import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Search, Plus, Globe, ChefHat, Info } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { TibebPattern } from "./TibebPattern";
import { FoodDetailsModal } from "./FoodDetailsModal";

export interface EthiopianFood {
  id: string;
  name: string;
  nameAmharic: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  serving: string;
  image: string;
  recipe?: {
    description: string;
    ingredients: string[];
    instructions: string[];
  };
}

// RESTORED IMAGE DATA
const ethiopianFoods: EthiopianFood[] = [
  {
    id: "1",
    name: "Injera with Doro Wat",
    nameAmharic: "እንጀራ ከዶሮ ወጥ ጋር",
    calories: 450, protein: 28, carbs: 52, fat: 12, serving: "1 plate (300g)",
    image: "https://images.unsplash.com/flagged/photo-1572644973628-e9be84915d59?w=400&q=80"
  },
  {
    id: "2",
    name: "Kitfo",
    nameAmharic: "ክትፎ",
    calories: 380, protein: 32, carbs: 8, fat: 24, serving: "1 serving (200g)",
    image: "https://images.unsplash.com/photo-1647998270792-69ac80570183?w=400&q=80"
  },
  {
    id: "3",
    name: "Shiro Wat",
    nameAmharic: "ሽሮ ወጥ",
    calories: 280, protein: 14, carbs: 38, fat: 8, serving: "1 cup (200g)",
    image: "https://images.unsplash.com/photo-1596235502219-a1c80d8be60c?w=400&q=80"
  },
  {
    id: "4",
    name: "Tibs",
    nameAmharic: "ጥብስ",
    calories: 320, protein: 26, carbs: 12, fat: 18, serving: "1 serving (250g)",
    image: "https://images.unsplash.com/photo-1765338915553-6e02fe63ff4f?w=400&q=80"
  },
  {
    id: "5",
    name: "Gomen",
    nameAmharic: "ጎመን",
    calories: 120, protein: 6, carbs: 18, fat: 3, serving: "1 cup",
    image: "https://images.unsplash.com/photo-1633980990916-74317cba1ea3?w=400&q=80"
  }
];

interface EthiopianFoodDatabaseProps {
  onAddFood: (food: EthiopianFood) => void;
  onApiSearch: (query: string) => void; 
}

export function EthiopianFoodDatabase({ onAddFood, onApiSearch }: EthiopianFoodDatabaseProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFood, setSelectedFood] = useState<EthiopianFood | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredFoods = ethiopianFoods.filter(
    (food) =>
      food.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      food.nameAmharic.includes(searchTerm)
  );

  const handleFoodClick = (food: EthiopianFood) => {
    setSelectedFood(food);
    setIsModalOpen(true);
  };

  return (
    <>
      <Card className="h-full border-[#8b5a3c]/20 shadow-xl flex flex-col relative overflow-hidden bg-white/50 backdrop-blur-sm">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <TibebPattern className="w-full h-full text-[#8b5a3c]" />
        </div>
        
        <CardHeader className="pb-3 border-b border-[#8b5a3c]/10 bg-white/80 sticky top-0 z-10">
          <CardTitle className="text-[#2d2520] flex items-center gap-2">
             <ChefHat className="w-5 h-5 text-[#8b5a3c]" />
             Food Database
          </CardTitle>
          <div className="relative mt-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#786f66]" />
            <Input
              placeholder="Search Injera, Tibs, or 'Pasta'..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 border-[#8b5a3c]/20 focus:border-[#8b5a3c] bg-white"
            />
          </div>
        </CardHeader>

        <CardContent className="flex-1 p-4 overflow-y-auto custom-scrollbar" style={{ maxHeight: '600px' }}>
          <AnimatePresence>
            {/* LOCAL CARDS */}
            <div className="grid grid-cols-1 gap-4">
              {filteredFoods.map((food, index) => (
                <motion.div
                  key={food.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleFoodClick(food)}
                  className="group relative flex gap-3 p-3 rounded-xl bg-white border border-[#8b5a3c]/10 hover:border-[#8b5a3c]/40 hover:shadow-md transition-all cursor-pointer"
                >
                  <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                    <img src={food.image} alt={food.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="font-bold text-[#2d2520] truncate">{food.name}</h3>
                            <p className="text-xs text-[#8b5a3c]">{food.nameAmharic}</p>
                        </div>
                        <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-8 w-8 text-[#8b5a3c] hover:bg-[#8b5a3c]/10"
                            onClick={(e) => {
                                e.stopPropagation();
                                onAddFood(food);
                            }}
                        >
                            <Plus className="w-5 h-5" />
                        </Button>
                    </div>
                    <div className="flex gap-3 mt-2 text-xs text-[#786f66]">
                        <span className="flex items-center gap-1"><Info className="w-3 h-3"/> {food.calories} cal</span>
                        <span>P: {food.protein}g</span>
                        <span>C: {food.carbs}g</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* FALLBACK SEARCH BUTTON */}
            {filteredFoods.length === 0 && searchTerm.length > 2 && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-6 text-center p-6 bg-white/60 rounded-xl border border-dashed border-[#8b5a3c]/30"
                >
                    <Globe className="w-8 h-8 text-[#8b5a3c] mx-auto mb-2 opacity-50" />
                    <p className="text-[#2d2520] font-medium mb-1">Not in our Ethiopian list?</p>
                    <p className="text-xs text-[#786f66] mb-4">Search the global database for "{searchTerm}"</p>
                    <Button 
                        onClick={() => onApiSearch(searchTerm)}
                        variant="outline"
                        className="border-[#8b5a3c] text-[#8b5a3c] hover:bg-[#8b5a3c] hover:text-white"
                    >
                        Search Online & Add Log
                    </Button>
                </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
      
      <FoodDetailsModal
        food={selectedFood}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddFood={onAddFood}
      />
    </>
  );
}