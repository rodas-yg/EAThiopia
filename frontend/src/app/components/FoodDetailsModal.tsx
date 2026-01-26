import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
// Removed ScrollArea to fix the scrolling bug
import { Plus, Flame, Clock, Utensils } from "lucide-react";

export interface FoodWithRecipe {
  id?: string | number;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  description?: string;
  image?: string;
  
  // Accept any format the API sends us
  recipe?: string | {
    description?: string;
    ingredients?: string[];
    instructions?: string[] | string;
    prepTime?: string;
    cookTime?: string;
  };
  
  ingredients?: string[];
}

interface ModalProps {
  food: FoodWithRecipe | null;
  isOpen: boolean;
  onClose: () => void;
  onAddFood: (food: FoodWithRecipe) => void;
}

export function FoodDetailsModal({ food, isOpen, onClose, onAddFood }: ModalProps) {
  if (!food) return null;

  // --- SMART HELPERS to read data regardless of format ---

  const getInstructions = (): string => {
    if (!food.recipe) return "";

    // 1. Simple String
    if (typeof food.recipe === 'string') return food.recipe;

    // 2. Object with instructions array
    if (Array.isArray(food.recipe.instructions)) {
        return food.recipe.instructions.join('\n');
    }

    // 3. Object with instructions string
    if (typeof food.recipe.instructions === 'string') {
        return food.recipe.instructions;
    }

    return "";
  };

  const getIngredients = (): string[] => {
    // 1. Check top-level ingredients first
    if (food.ingredients && food.ingredients.length > 0) return food.ingredients;

    // 2. Check inside recipe object
    if (typeof food.recipe === 'object' && food.recipe !== null && 'ingredients' in food.recipe) {
        return food.recipe.ingredients || [];
    }
    return [];
  };

  // Run the helpers
  const instructions = getInstructions();
  const ingredients = getIngredients();
  
  // Extract times if available
  const prepTime = typeof food.recipe === 'object' ? food.recipe?.prepTime : null;
  const cookTime = typeof food.recipe === 'object' ? food.recipe?.cookTime : null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[85vh] flex flex-col p-0 bg-[#faf8f5] border-[#8b5a3c]/20 rounded-xl overflow-hidden">
        
        {/* IMAGE HEADER - Fixed at top */}
        <div className="shrink-0">
            {food.image ? (
                <div className="relative h-48 w-full">
                    <img src={food.image} alt={food.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-4 left-4 text-white">
                        <DialogTitle className="text-2xl font-bold">{food.name}</DialogTitle>
                        <p className="opacity-90">{food.description || "Ethiopian Delicacy"}</p>
                    </div>
                </div>
            ) : (
                <DialogHeader className="p-6 pb-2 bg-[#faf8f5]">
                    <DialogTitle className="text-2xl font-bold text-[#2d2520]">{food.name}</DialogTitle>
                    <DialogDescription>{food.description}</DialogDescription>
                </DialogHeader>
            )}
        </div>

        {/* SCROLLABLE CONTENT BODY */}
        {/* We use flex-1 and overflow-y-auto to ensure THIS part scrolls while header/footer stay put */}
        <div className="flex-1 overflow-y-auto p-6 pt-2 scrollbar-thin scrollbar-thumb-gray-300">
          
          {/* MACROS CARD */}
          <div className="grid grid-cols-3 gap-2 mb-6 text-center">
             <div className="bg-white p-3 rounded-xl border border-[#8b5a3c]/10 shadow-sm"><div className="text-xs text-[#786f66]">Protein</div><div className="font-bold">{Math.round(food.protein)}g</div></div>
             <div className="bg-white p-3 rounded-xl border border-[#8b5a3c]/10 shadow-sm"><div className="text-xs text-[#786f66]">Carbs</div><div className="font-bold">{Math.round(food.carbs)}g</div></div>
             <div className="bg-white p-3 rounded-xl border border-[#8b5a3c]/10 shadow-sm"><div className="text-xs text-[#786f66]">Fat</div><div className="font-bold">{Math.round(food.fat)}g</div></div>
          </div>

          {/* TIME BADGES */}
          {(prepTime || cookTime) && (
             <div className="flex gap-4 mb-6 text-sm text-[#786f66] bg-white p-2 rounded-lg border border-[#8b5a3c]/10">
                {prepTime && <div className="flex items-center gap-1"><Clock className="w-4 h-4 text-[#8b5a3c]"/> Prep: {prepTime}</div>}
                {cookTime && <div className="flex items-center gap-1"><Utensils className="w-4 h-4 text-[#8b5a3c]"/> Cook: {cookTime}</div>}
             </div>
          )}

           {/* INGREDIENTS LIST */}
           {ingredients.length > 0 && (
            <div className="mb-6">
                <h3 className="text-sm font-bold text-[#8b5a3c] uppercase mb-2">Ingredients</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-[#5a524a]">
                    {ingredients.map((ing, i) => (
                        <li key={i}>{ing}</li>
                    ))}
                </ul>
            </div>
          )}

          {/* INSTRUCTIONS TEXT */}
          {instructions && (
             <div className="mb-6">
                <h3 className="text-sm font-bold text-[#8b5a3c] uppercase mb-2 flex items-center gap-2">
                    <Flame className="w-4 h-4" /> Instructions
                </h3>
                <div className="text-sm text-[#5a524a] leading-relaxed whitespace-pre-line">
                    {instructions}
                </div>
             </div>
          )}

          {/* FALLBACK MESSAGE */}
          {!instructions && ingredients.length === 0 && (
              <div className="p-4 bg-yellow-50 text-yellow-800 rounded-lg text-sm text-center border border-yellow-200">
                  Full recipe details not available for this item.
              </div>
          )}
        </div>

        {/* FOOTER - Fixed at bottom */}
        <div className="shrink-0 p-4 border-t border-[#8b5a3c]/10 bg-white">
            <Button 
                onClick={() => onAddFood(food)} 
                className="w-full bg-[#8b5a3c] hover:bg-[#6b4423] text-lg h-12 shadow-md transition-transform active:scale-[0.98]"
            >
                <Plus className="mr-2 w-5 h-5" /> Add to Log ({Math.round(food.calories)} cal)
            </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}