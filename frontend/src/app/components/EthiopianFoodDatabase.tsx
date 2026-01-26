import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { Search, Plus, ChefHat, Sparkles } from "lucide-react";
import { FoodWithRecipe } from "./FoodDetailsModal"; 

interface FoodDatabaseProps {
  onAddFood: (food: FoodWithRecipe) => void;
  onViewRecipe: (food: FoodWithRecipe) => void;
  onApiSearch: (query: string) => void;
  searchResults: FoodWithRecipe[];
}

export function EthiopianFoodDatabase({ onAddFood, onViewRecipe, onApiSearch, searchResults }: FoodDatabaseProps) {
  const [searchQuery, setSearchQuery] = useState("");

  // --- HARDCODED RECIPES (Fixed) ---
  const ethiopianFoods: FoodWithRecipe[] = [
    { 
        name: "Doro Wat", 
        calories: 300, protein: 28, carbs: 8, fat: 18, 
        description: "Spicy chicken stew (The National Dish)",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/Doro_wat.jpg/800px-Doro_wat.jpg",
        recipe: {
            description: "Slow-cooked chicken stew with berbere and niter kibbeh.",
            prepTime: "45 min",
            cookTime: "1 hr 30 min",
            ingredients: [
                "4 Chicken legs/thighs (skinless)",
                "4 Red Onions (finely diced)",
                "1/2 cup Niter Kibbeh (Spiced Butter)",
                "1/4 cup Berbere spice",
                "1 tbsp Garlic & Ginger paste",
                "4 Hard-boiled eggs",
                "1 tsp Salt",
                "1 tbsp Tomato paste (optional)"
            ],
            instructions: [
                "1. Dry cook the onions in a pot over low heat for 30-45 mins until caramelized and brown (add splashes of water if sticking).",
                "2. Add the Niter Kibbeh (butter) and sauté for 5 minutes.",
                "3. Add Ginger, Garlic, and Berbere. Cook for another 5-10 minutes to release flavors.",
                "4. Add the chicken pieces and coat well in the sauce. Simmer for 15 minutes.",
                "5. Add 1-2 cups of water (or broth) and cover. Simmer on low for 45 minutes until chicken is tender.",
                "6. Add hard-boiled eggs (make small slits in them) in the last 10 minutes.",
                "7. Serve hot with Injera."
            ]
        }
    },
    { 
        name: "Injera", 
        calories: 150, protein: 4, carbs: 30, fat: 1, 
        description: "Sourdough teff flatbread",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Alicha_1.jpg/800px-Alicha_1.jpg",
        recipe: {
            description: "The staple bread of Ethiopia, made from fermented teff flour.",
            prepTime: "3 Days",
            cookTime: "20 min",
            ingredients: [
                "2 cups Teff flour (Brown or Ivory)",
                "3 cups Water",
                "1/4 tsp Active dry yeast (or Ersho starter)"
            ],
            instructions: [
                "1. Mix Teff flour and 2.5 cups of water in a bowl. Cover and let sit at room temperature for 2-3 days (until bubbly and sour smelling).",
                "2. After fermentation, drain any yellow liquid on top.",
                "3. Boil 1/2 cup water and stir it into 1/2 cup of the batter (Absit) to thicken, then mix this back into the main batter.",
                "4. Add water if needed to reach crepe batter consistency.",
                "5. Heat a non-stick pan (Mitad). Pour batter in a spiral from outside in.",
                "6. Wait for 'eyes' (bubbles) to form, then cover with lid for 1-2 minutes until cooked through (do not flip!).",
                "7. Slide off onto a plate and let cool."
            ]
        }
    },
    { 
        name: "Shiro Wat", 
        calories: 200, protein: 12, carbs: 25, fat: 6, 
        description: "Chickpea stew",
        image: "https://upload.wikimedia.org/wikipedia/commons/2/23/Shiro_wat.jpg",
        recipe: {
            description: "Smooth, savory chickpea stew powered by garlic and onions.",
            prepTime: "10 min",
            cookTime: "30 min",
            ingredients: [
                "1/2 cup Shiro powder (Chickpea flour blend)",
                "1 Onion (finely diced)",
                "2 Tomatoes (diced) or 1 tbsp paste",
                "1/3 cup Oil or Niter Kibbeh",
                "2 cups Water",
                "1 Jalapeno (optional)"
            ],
            instructions: [
                "1. Sauté onions in oil until translucent.",
                "2. Add tomatoes and garlic, cook until tomatoes break down.",
                "3. Add 2 cups of water and bring to a boil.",
                "4. Slowly whisk in the Shiro powder to avoid lumps.",
                "5. Lower heat and simmer until the sauce thickens (oil should separate slightly on top).",
                "6. Add the Jalapeno (whole) for flavor in the last 5 minutes.",
                "7. Serve bubbling hot."
            ]
        }
    },
    { 
        name: "Kitfo", 
        calories: 250, protein: 22, carbs: 2, fat: 16, 
        description: "Minced beef tartare",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Kitfo.jpg/800px-Kitfo.jpg",
        recipe: {
            description: "Melt-in-your-mouth minced beef seasoned with spicy chili powder.",
            prepTime: "15 min",
            cookTime: "5 min",
            ingredients: [
                "1 lb Lean Beef (Top round/steak), freshly minced",
                "4 tbsp Niter Kibbeh (Clarified Spiced Butter)",
                "1-2 tbsp Mitmita (Hot chili powder)",
                "1 tsp Korerima (Cardamom powder)",
                "Salt to taste"
            ],
            instructions: [
                "1. Melt the Niter Kibbeh in a pan on low heat (do not let it smoke).",
                "2. Mix the Mitmita and Korerima into the melted butter.",
                "3. In a bowl, toss the minced beef with the spiced butter mixture until fully coated.",
                "4. Serve RAW (traditional) or lightly heat in the pan for 2 minutes for 'Leb Leb' (rare).",
                "5. Serve with Kocho or Injera and Gomen (Collard Greens)."
            ]
        }
    },
    { 
        name: "Misir Wat", 
        calories: 220, protein: 14, carbs: 32, fat: 4, 
        description: "Spicy red lentil stew",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Misir_wat.jpg/800px-Misir_wat.jpg",
        recipe: {
            description: "Hearty red lentils cooked in a spicy berbere sauce.",
            prepTime: "10 min",
            cookTime: "40 min",
            ingredients: [
                "1 cup Red Lentils (washed)",
                "2 Onions (finely chopped)",
                "2 tbsp Berbere spice",
                "1/4 cup Oil",
                "1 tsp Garlic paste",
                "3 cups Water"
            ],
            instructions: [
                "1. Fry onions in dry pan until soft, then add oil.",
                "2. Add Berbere spice and garlic, cook for 2-3 minutes (add a splash of water so it doesn't burn).",
                "3. Add the washed lentils and stir to coat.",
                "4. Add water, cover, and simmer on low heat for 30 minutes.",
                "5. Stir occasionally to prevent sticking. Cook until lentils are soft and sauce is thick."
            ]
        }
    },
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
            placeholder="Search foods (e.g., 'Shiro')..." 
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
            
          {/* API SEARCH RESULTS */}
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

          {/* POPULAR ITEMS LIST (Now with Working Recipes) */}
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