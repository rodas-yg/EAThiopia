import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Search, Plus, ChefHat, Info, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react"; 
import { TibebPattern } from "./TibebPattern";
import { FoodDetailsModal, FoodWithRecipe } from "./FoodDetailsModal";

// --- LOCAL DATA ---
const ethiopianFoods: FoodWithRecipe[] = [
  {
    id: "1",
    name: "Injera with Doro Wat",
    nameAmharic: "እንጀራ ከዶሮ ወጥ ጋር",
    calories: 450, protein: 28, carbs: 52, fat: 12, serving: "1 plate (300g)",
    image: "https://images.unsplash.com/flagged/photo-1572644973628-e9be84915d59?w=400&q=80",
    recipe: {
        description: "A spicy chicken stew simmered in berbere sauce, served with sourdough flatbread.",
        ingredients: ["Chicken legs", "Berbere spice", "Red Onions", "Garlic", "Ginger", "Injera"],
        instructions: ["Sauté onions until caramelized", "Add spices and chicken", "Simmer for 45 mins", "Serve on Injera"]
    }
  },
  {
    id: "2",
    name: "Kitfo",
    nameAmharic: "ክትፎ",
    calories: 380, protein: 32, carbs: 8, fat: 24, serving: "1 serving (200g)",
    image: "https://images.unsplash.com/photo-1647998270792-69ac80570183?w=400&q=80",
    recipe: {
        description: "Minced raw beef marinated in mitmita (spiced chili powder) and niter kibbeh (clarified butter).",
        ingredients: ["Lean Beef", "Mitmita", "Niter Kibbeh", "Cardamom"],
        instructions: ["Mince beef finely", "Melt seasoned butter", "Mix beef with spices and butter", "Serve immediately with Kocho"]
    }
  },
  {
    id: "3",
    name: "Shiro Wat",
    nameAmharic: "ሽሮ ወጥ",
    calories: 280, protein: 14, carbs: 38, fat: 8, serving: "1 cup (200g)",
    image: "https://images.unsplash.com/photo-1596235502219-a1c80d8be60c?w=400&q=80",
    recipe: {
        description: "A rich, chickpea powder stew.",
        ingredients: ["Shiro Powder", "Onions", "Garlic", "Tomato"],
        instructions: ["Sauté aromatics", "Whisk shiro powder in water", "Add to pot and simmer until thick"]
    }
  }
];

interface EthiopianFoodDatabaseProps {
  onAddFood: (food: FoodWithRecipe) => void;
  onApiSearch: (query: string) => void; 
}

export function EthiopianFoodDatabase({ onAddFood, onApiSearch }: EthiopianFoodDatabaseProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFood, setSelectedFood] = useState<FoodWithRecipe | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // New State for API Results
  const [apiResults, setApiResults] = useState<FoodWithRecipe[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (query: string) => {
    setSearchTerm(query);
    if (query.length < 3) {
        setApiResults([]);
        return;
    }

    setIsSearching(true);
    try {
        const res = await fetch(`http://127.0.0.1:5000/api/recipes/search?query=${query}`);
        if (res.ok) {
            const data = await res.json();
            setApiResults(data);
        }
    } catch (e) {
        console.error("API Search failed", e);
    } finally {
        setIsSearching(false);
    }
  };

  // Combine Local Filtered items with API results
  const localFiltered = ethiopianFoods.filter(
    (food) =>
      food.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (food.nameAmharic && food.nameAmharic.includes(searchTerm))
  );

  const displayFoods = searchTerm.length > 2 && apiResults.length > 0 ? apiResults : localFiltered;

  const handleFoodClick = (food: FoodWithRecipe) => {
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
             Recipe Database
          </CardTitle>
          <div className="relative mt-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#786f66]" />
            <Input
              placeholder="Search recipes (e.g., 'Pasta', 'Doro Wat')..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-9 border-[#8b5a3c]/20 focus:border-[#8b5a3c] bg-white"
            />
          </div>
        </CardHeader>

        <CardContent className="flex-1 p-4 overflow-y-auto custom-scrollbar" style={{ maxHeight: '600px' }}>
          {isSearching ? (
             <div className="flex flex-col items-center justify-center py-10 text-[#8b5a3c]">
                <Loader2 className="w-8 h-8 animate-spin mb-2" />
                <p>Finding recipes...</p>
             </div>
          ) : (
             <AnimatePresence>
                <div className="grid grid-cols-1 gap-4">
                {displayFoods.map((food, index) => (
                    <motion.div
                    key={food.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleFoodClick(food)}
                    className="group relative flex gap-3 p-3 rounded-xl bg-white border border-[#8b5a3c]/10 hover:border-[#8b5a3c]/40 hover:shadow-md transition-all cursor-pointer"
                    >
                    <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 relative">
                        <img src={food.image} alt={food.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-bold text-[#2d2520] truncate">{food.name}</h3>
                                {food.nameAmharic && <p className="text-xs text-[#8b5a3c]">{food.nameAmharic}</p>}
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

                {displayFoods.length === 0 && !isSearching && searchTerm.length > 2 && (
                    <div className="text-center p-8 text-[#786f66]">
                        <p>No recipes found.</p>
                        <Button 
                            variant="link" 
                            onClick={() => onApiSearch(searchTerm)}
                            className="mt-2 text-[#8b5a3c]"
                        >
                            Try Quick Log Instead?
                        </Button>
                    </div>
                )}
             </AnimatePresence>
          )}
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