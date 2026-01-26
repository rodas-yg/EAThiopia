import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { Clock, ChefHat, Plus } from "lucide-react";

// --- THE FIX: Added 'nameAmharic', 'serving', and 'cuisine' to the interface ---
export interface FoodWithRecipe {
  id?: string | number;
  name: string;
  nameAmharic?: string; // <--- Fixed the error here
  cuisine?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  serving?: string;
  image?: string;
  description?: string;
  recipe?: {
    description?: string;
    prepTime?: string;
    cookTime?: string;
    ingredients?: string[];
    instructions?: string[];
  };
  ingredients?: string[]; // Fallback for simple structure
  instructions?: string[]; // Fallback for simple structure
}

interface FoodDetailsModalProps {
  food: FoodWithRecipe | null;
  isOpen: boolean;
  onClose: () => void;
  onAddFood: (food: FoodWithRecipe) => void;
}

export function FoodDetailsModal({ food, isOpen, onClose, onAddFood }: FoodDetailsModalProps) {
  if (!food) return null;

  // normalize recipe data
  const recipe = food.recipe || {
    description: food.description || "No description available.",
    prepTime: "-",
    cookTime: "-",
    ingredients: food.ingredients || [],
    instructions: food.instructions || []
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0 overflow-hidden bg-white border-[#8b5a3c]/20">
        
        {/* Header Image Area */}
        <div className="relative h-48 w-full bg-gray-100 shrink-0">
          {food.image ? (
            <img src={food.image} alt={food.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[#8b5a3c]/40">
                <ChefHat className="w-16 h-16" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-4 left-6 text-white">
            <h2 className="text-2xl font-bold">{food.name}</h2>
            {food.nameAmharic && <p className="text-sm opacity-90">{food.nameAmharic}</p>}
            <p className="text-sm opacity-80">{food.calories} kcal • {food.protein}g Protein</p>
          </div>
        </div>

        {/* Scrollable Content */}
        <ScrollArea className="flex-1 p-6">
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4 p-4 bg-[#f5f1ec] rounded-xl border border-[#8b5a3c]/10">
                <div className="text-center">
                    <span className="block text-xl font-bold text-[#8b5a3c]">{food.protein}g</span>
                    <span className="text-xs text-[#786f66] uppercase tracking-wide">Protein</span>
                </div>
                <div className="text-center border-l border-[#8b5a3c]/20">
                    <span className="block text-xl font-bold text-[#8b5a3c]">{food.carbs}g</span>
                    <span className="text-xs text-[#786f66] uppercase tracking-wide">Carbs</span>
                </div>
                <div className="text-center border-l border-[#8b5a3c]/20">
                    <span className="block text-xl font-bold text-[#8b5a3c]">{food.fat}g</span>
                    <span className="text-xs text-[#786f66] uppercase tracking-wide">Fat</span>
                </div>
            </div>

            {/* Description & Times */}
            <div>
                <p className="text-[#2d2520] leading-relaxed">{recipe.description}</p>
                <div className="flex gap-6 mt-4 text-sm text-[#786f66]">
                    <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" /> 
                        <span className="font-semibold">Prep:</span> {recipe.prepTime || "-"}
                    </div>
                    <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span className="font-semibold">Cook:</span> {recipe.cookTime || "-"}
                    </div>
                </div>
            </div>

            {/* Ingredients */}
            {recipe.ingredients && recipe.ingredients.length > 0 && (
                <div>
                    <h3 className="font-bold text-[#8b5a3c] mb-3 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#8b5a3c]" /> Ingredients
                    </h3>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {recipe.ingredients.map((ing: string, i: number) => (
                            <li key={i} className="text-sm text-[#5d5d5d] flex items-start gap-2">
                                <span className="text-[#8b5a3c]/60">•</span> {ing}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Instructions */}
            {recipe.instructions && recipe.instructions.length > 0 && (
                <div>
                    <h3 className="font-bold text-[#8b5a3c] mb-3 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#8b5a3c]" /> Instructions
                    </h3>
                    <div className="space-y-3">
                        {recipe.instructions.map((step: string, i: number) => (
                            <div key={i} className="flex gap-3 text-sm text-[#5d5d5d]">
                                <span className="font-bold text-[#8b5a3c]">{i + 1}.</span>
                                <p>{step}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
          </div>
        </ScrollArea>

        {/* Footer Actions */}
        <div className="p-4 border-t border-[#8b5a3c]/10 bg-gray-50 flex justify-end gap-3 shrink-0">
            <Button variant="outline" onClick={onClose}>Close</Button>
            <Button onClick={() => onAddFood(food)} className="bg-[#8b5a3c] hover:bg-[#6b4423]">
                <Plus className="w-4 h-4 mr-2" /> Add to Log
            </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}