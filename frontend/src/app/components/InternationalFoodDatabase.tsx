import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Search, Plus, AlertCircle } from "lucide-react";
import { motion } from "motion/react";
import { TibebPattern } from "./TibebPattern";
import { FoodDetailsModal, FoodWithRecipe } from "./FoodDetailsModal";
import { Alert, AlertDescription } from "./ui/alert";

// NOTE: We now use FoodWithRecipe instead of defining a separate InternationalFood interface
interface InternationalFoodDatabaseProps {
  onAddFood: (food: FoodWithRecipe) => void;
}

const internationalFoods: FoodWithRecipe[] = [
  {
    id: "int-1",
    name: "Margherita Pizza",
    cuisine: "Italian",
    calories: 266,
    protein: 11,
    carbs: 33,
    fat: 10,
    serving: "1 slice (107g)",
    image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
    recipe: {
      description: "Classic Italian pizza with tomato sauce, fresh mozzarella, basil, and olive oil on a thin crust.",
      prepTime: "20 minutes (plus 1 hour rising)",
      cookTime: "12 minutes",
      ingredients: ["Pizza dough", "Tomato sauce", "Fresh mozzarella", "Basil", "Olive oil"],
      instructions: ["Roll dough", "Add toppings", "Bake at 475°F for 12 mins"]
    }
  },
  {
    id: "int-2",
    name: "Chicken Teriyaki",
    cuisine: "Japanese",
    calories: 385,
    protein: 34,
    carbs: 28,
    fat: 15,
    serving: "1 serving (250g)",
    image: "https://images.unsplash.com/photo-1623428187969-5da2dcea5ebf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
    recipe: {
      description: "Grilled chicken glazed with sweet and savory teriyaki sauce.",
      prepTime: "15 min",
      cookTime: "15 min",
      ingredients: ["Chicken thighs", "Soy sauce", "Mirin", "Sugar", "Ginger"],
      instructions: ["Marinate chicken", "Grill until cooked", "Simmer sauce until thick", "Coat chicken"]
    }
  },
  // Add more items as needed...
];

export function InternationalFoodDatabase({ onAddFood }: InternationalFoodDatabaseProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFood, setSelectedFood] = useState<FoodWithRecipe | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredFoods = internationalFoods.filter(
    (food) =>
      food.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (food.cuisine && food.cuisine.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleFoodClick = (food: FoodWithRecipe) => {
    setSelectedFood(food);
    setIsModalOpen(true);
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
          <CardTitle className="text-[#2d2520]">International Cuisine</CardTitle>
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#786f66]" />
            <Input
              placeholder="Search international foods..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-[#8b5a3c]/20 focus:border-[#8b5a3c] bg-[#f5f1ec]"
            />
          </div>
        </CardHeader>
        <CardContent className="pt-6 relative space-y-4">
          <Alert className="border-[#8b5a3c]/20 bg-[#f5f1ec]">
            <AlertCircle className="h-4 w-4 text-[#8b5a3c]" />
            <AlertDescription className="text-[#786f66]">
              Search specifically for international dishes here.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[600px] overflow-y-auto">
            {filteredFoods.map((food, index) => (
              <motion.div
                key={food.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                whileHover={{ scale: 1.02 }}
                className="group relative overflow-hidden rounded-lg border border-[#8b5a3c]/20 bg-white shadow-sm hover:shadow-lg transition-all cursor-pointer"
                onClick={() => handleFoodClick(food)}
              >
                <div className="relative h-32 overflow-hidden">
                  <img
                    src={food.image}
                    alt={food.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute top-2 right-2">
                    <span className="px-2 py-1 bg-white/90 text-[#8b5a3c] text-xs rounded-full font-medium">
                      {food.cuisine}
                    </span>
                  </div>
                  <div className="absolute bottom-2 left-2 right-2">
                    <p className="text-white font-semibold text-sm">{food.name}</p>
                  </div>
                </div>

                <div className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-lg font-bold text-[#8b5a3c]">{food.calories} cal</span>
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddFood(food);
                      }}
                      className="bg-[#8b5a3c] hover:bg-[#6b4423] h-7 text-xs"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Add
                    </Button>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs text-[#786f66]">
                    <div className="text-center">
                      <div className="font-medium text-[#2d2520]">{food.protein}g</div>
                      <div>Protein</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-[#2d2520]">{food.carbs}g</div>
                      <div>Carbs</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-[#2d2520]">{food.fat}g</div>
                      <div>Fat</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
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