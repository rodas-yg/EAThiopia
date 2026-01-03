import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Plus, X } from "lucide-react";
import { ScrollArea } from "./ui/scroll-area";
import { motion } from "motion/react";
import { TibebPattern } from "./TibebPattern";

export interface FoodWithRecipe {
  id: string;
  name: string;
  nameAmharic?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  serving: string;
  image: string;
  recipe: {
    description: string;
    ingredients: string[];
    instructions: string[];
    prepTime?: string;
    cookTime?: string;
  };
}

interface FoodDetailsModalProps {
  food: FoodWithRecipe | null;
  isOpen: boolean;
  onClose: () => void;
  onAddFood?: (food: FoodWithRecipe) => void;
}

export function FoodDetailsModal({ food, isOpen, onClose, onAddFood }: FoodDetailsModalProps) {
  if (!food) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] p-0 overflow-hidden border-[#8b5a3c]/20">
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <TibebPattern className="w-full h-full text-[#8b5a3c]" />
        </div>
        
        <ScrollArea className="h-full max-h-[90vh]">
          <div className="relative">
            {/* Hero Image */}
            <div className="relative h-64 overflow-hidden">
              <img
                src={food.image}
                alt={food.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-3xl font-bold text-white mb-2"
                >
                  {food.name}
                </motion.h2>
                {food.nameAmharic && (
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-xl text-white/90 font-['Crimson_Text']"
                  >
                    {food.nameAmharic}
                  </motion.p>
                )}
              </div>
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 relative">
              {/* Nutritional Information */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h3 className="text-lg font-semibold text-[#2d2520] mb-3 flex items-center">
                  Nutritional Information
                  <span className="ml-2 text-sm text-[#786f66]">({food.serving})</span>
                </h3>
                <div className="grid grid-cols-4 gap-4">
                  <div className="bg-[#f5f1ec] rounded-lg p-4 text-center border border-[#8b5a3c]/10">
                    <div className="text-2xl font-bold text-[#8b5a3c]">{food.calories}</div>
                    <div className="text-sm text-[#786f66]">Calories</div>
                  </div>
                  <div className="bg-[#f5f1ec] rounded-lg p-4 text-center border border-[#8b5a3c]/10">
                    <div className="text-2xl font-bold text-[#8b5a3c]">{food.protein}g</div>
                    <div className="text-sm text-[#786f66]">Protein</div>
                  </div>
                  <div className="bg-[#f5f1ec] rounded-lg p-4 text-center border border-[#8b5a3c]/10">
                    <div className="text-2xl font-bold text-[#8b5a3c]">{food.carbs}g</div>
                    <div className="text-sm text-[#786f66]">Carbs</div>
                  </div>
                  <div className="bg-[#f5f1ec] rounded-lg p-4 text-center border border-[#8b5a3c]/10">
                    <div className="text-2xl font-bold text-[#8b5a3c]">{food.fat}g</div>
                    <div className="text-sm text-[#786f66]">Fat</div>
                  </div>
                </div>
              </motion.div>

              {/* Recipe Description */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h3 className="text-lg font-semibold text-[#2d2520] mb-3">About This Dish</h3>
                <p className="text-[#786f66] leading-relaxed">{food.recipe.description}</p>
              </motion.div>

              {/* Time Information */}
              {(food.recipe.prepTime || food.recipe.cookTime) && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex gap-4 text-sm"
                >
                  {food.recipe.prepTime && (
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-[#2d2520]">Prep:</span>
                      <span className="text-[#786f66]">{food.recipe.prepTime}</span>
                    </div>
                  )}
                  {food.recipe.cookTime && (
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-[#2d2520]">Cook:</span>
                      <span className="text-[#786f66]">{food.recipe.cookTime}</span>
                    </div>
                  )}
                </motion.div>
              )}

              <div className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#8b5a3c]/20 to-transparent" />

              {/* Ingredients */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="pt-4"
              >
                <h3 className="text-lg font-semibold text-[#2d2520] mb-3">Ingredients</h3>
                <ul className="space-y-2">
                  {food.recipe.ingredients.map((ingredient, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + index * 0.05 }}
                      className="flex items-start gap-3 text-[#786f66]"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-[#8b5a3c] mt-2 flex-shrink-0" />
                      <span>{ingredient}</span>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>

              <div className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#8b5a3c]/20 to-transparent" />

              {/* Instructions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="pt-4"
              >
                <h3 className="text-lg font-semibold text-[#2d2520] mb-3">Instructions</h3>
                <ol className="space-y-4">
                  {food.recipe.instructions.map((instruction, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + index * 0.05 }}
                      className="flex items-start gap-4"
                    >
                      <span className="flex-shrink-0 w-8 h-8 rounded-full bg-[#8b5a3c] text-white flex items-center justify-center font-semibold text-sm">
                        {index + 1}
                      </span>
                      <span className="text-[#786f66] pt-1">{instruction}</span>
                    </motion.li>
                  ))}
                </ol>
              </motion.div>

              {/* Add Button */}
              {onAddFood && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="sticky bottom-0 bg-gradient-to-t from-white via-white to-transparent pt-6 pb-2"
                >
                  <Button
                    onClick={() => {
                      onAddFood(food);
                      onClose();
                    }}
                    className="w-full bg-[#8b5a3c] hover:bg-[#6b4423] text-white h-12"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Add to My Meals
                  </Button>
                </motion.div>
              )}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
