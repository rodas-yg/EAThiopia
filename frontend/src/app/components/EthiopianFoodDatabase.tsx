import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { Search, Plus, ChefHat, Sparkles } from "lucide-react";
import { FoodWithRecipe } from "./FoodDetailsModal"; // Import Interface

interface FoodDatabaseProps {
  onAddFood: (food: FoodWithRecipe) => void;
  onViewRecipe: (food: FoodWithRecipe) => void;
  onApiSearch: (query: string) => void;
  searchResults: FoodWithRecipe[];
}

export function EthiopianFoodDatabase({ onAddFood, onViewRecipe, onApiSearch, searchResults }: FoodDatabaseProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const ethiopianFoods: FoodWithRecipe[] = [
    { name: "Doro Wat", calories: 300, protein: 28, carbs: 8, fat: 18, description: "Spicy chicken stew" },
    { name: "Injera", calories: 150, protein: 4, carbs: 30, fat: 1, description: "Sourdough flatbread" },
    { name: "Shiro", calories: 200, protein: 12, carbs: 25, fat: 6, description: "Chickpea stew" },
    { name: "Kitfo", calories: 250, protein: 22, carbs: 2, fat: 16, description: "Minced raw beef" },
    { name: "Misir Wat", calories: 220, protein: 14, carbs: 32, fat: 4, description: "Spicy lentil stew" },
  ];

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') onApiSearch(searchQuery);
  };

  return (
    <Card className="h-full border-[#8b5a3c]/20 bg-white shadow-sm flex flex-col">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2 mb-2">
            <ChefHat className="w-5 h-5 text-[#8b5a3c]" />
            <CardTitle className="text-[#2d2520]">Food Library</CardTitle>
        </div>
        <div className="flex gap-2">
          <Input 
            placeholder="Search foods..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="bg-[#f5f1ec] border-none"
          />
          <Button size="icon" className="bg-[#8b5a3c] hover:bg-[#6b4423]" onClick={() => onApiSearch(searchQuery)}>
            <Search className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 p-0 overflow-hidden">
        <ScrollArea className="h-full px-6 pb-4">
            
          {/* SEARCH RESULTS */}
          {searchResults.length > 0 && (
             <div className="mb-6">
                <h3 className="text-xs font-bold text-[#8b5a3c] uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Sparkles className="w-3 h-3" /> Search Results
                </h3>
                <div className="space-y-3">
                    {searchResults.map((food, i) => (
                    <div 
                        key={`search-${i}`} 
                        className="flex items-center justify-between p-3 rounded-xl bg-[#8b5a3c]/5 border border-[#8b5a3c]/20 group hover:bg-[#8b5a3c]/10 transition-colors cursor-pointer"
                        onClick={() => onViewRecipe(food)} 
                    >
                        <div className="flex items-center gap-3">
                            {food.image && (
                                <img src={food.image} alt={food.name} className="w-10 h-10 rounded-md object-cover" />
                            )}
                            <div>
                                <div className="font-medium text-[#2d2520]">{food.name}</div>
                                <div className="text-xs text-[#786f66]">
                                    {food.calories} kcal • {food.protein}g protein
                                </div>
                            </div>
                        </div>
                        <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-8 w-8 text-[#8b5a3c] opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => { e.stopPropagation(); onAddFood(food); }} 
                        >
                            <Plus className="w-5 h-5" />
                        </Button>
                    </div>
                    ))}
                </div>
             </div>
          )}

          {/* STANDARD LIST */}
          <h3 className="text-xs font-bold text-[#786f66] uppercase tracking-wider mb-3">Popular Items</h3>
          <div className="space-y-3">
            {ethiopianFoods.map((food, i) => (
              <div 
                key={i} 
                className="flex items-center justify-between p-3 rounded-xl hover:bg-[#f5f1ec] group transition-colors cursor-pointer"
                onClick={() => onViewRecipe(food)}
              >
                <div>
                  <div className="font-medium text-[#2d2520]">{food.name}</div>
                  <div className="text-xs text-[#786f66]">{food.calories} kcal • {food.protein}g protein</div>
                </div>
                <Button 
                    size="icon" 
                    variant="ghost" 
                    className="h-8 w-8 text-[#8b5a3c] opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => { e.stopPropagation(); onAddFood(food); }}
                >
                    <Plus className="w-5 h-5" />
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}