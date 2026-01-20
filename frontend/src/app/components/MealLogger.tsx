import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Plus, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { TibebPattern } from "./TibebPattern";

// 👇 CHANGED: id can be string OR number
export interface MealEntry {
  id: string | number;
  foodName: string;
  calories: number;
  servings: number;
  timestamp: Date;
  protein?: number;
  carbs?: number;
  fats?: number;
}

interface MealLoggerProps {
  meals: MealEntry[];
  onAddMeal: (meal: Omit<MealEntry, 'id' | 'timestamp'>) => void;
  // 👇 CHANGED: onRemoveMeal now accepts string OR number
  onRemoveMeal: (id: string | number) => void;
}

export function MealLogger({ meals, onAddMeal, onRemoveMeal }: MealLoggerProps) {
  const [open, setOpen] = useState(false);
  const [foodName, setFoodName] = useState("");
  const [calories, setCalories] = useState("");
  const [servings, setServings] = useState("1");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (foodName && calories) {
      onAddMeal({
        foodName,
        calories: Number(calories),
        servings: Number(servings),
      });
      setFoodName("");
      setCalories("");
      setServings("1");
      setOpen(false);
    }
  };

  const todayMeals = meals.filter(meal => {
    const today = new Date();
    const mealDate = new Date(meal.timestamp);
    return mealDate.toDateString() === today.toDateString();
  });

  return (
    <Card className="w-full border-[#8b5a3c]/20 shadow-lg relative overflow-hidden">
      <div className="absolute inset-0 opacity-5">
        <TibebPattern className="w-full h-full text-[#8b5a3c]" />
      </div>
      <CardHeader className="flex flex-row items-center justify-between relative border-b border-[#8b5a3c]/10">
        <div className="absolute bottom-0 left-0 right-0 h-2">
          <TibebPattern className="w-full h-full text-[#8b5a3c]" variant="border" />
        </div>
        <CardTitle className="text-[#2d2520]">Today's Meals</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-[#8b5a3c] hover:bg-[#6b4423]">
              <Plus className="w-4 h-4 mr-2" />
              Add Meal
            </Button>
          </DialogTrigger>
          <DialogContent className="border-[#8b5a3c]/20">
            <DialogHeader>
              <DialogTitle className="text-[#2d2520]">Log a Meal</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="foodName">Food Name</Label>
                <Input
                  id="foodName"
                  value={foodName}
                  onChange={(e) => setFoodName(e.target.value)}
                  placeholder="e.g., Injera with Doro Wat"
                  className="border-[#8b5a3c]/20 focus:border-[#8b5a3c] bg-[#f5f1ec]"
                  required
                />
              </div>
              <div>
                <Label htmlFor="calories">Calories (per serving)</Label>
                <Input
                  id="calories"
                  type="number"
                  value={calories}
                  onChange={(e) => setCalories(e.target.value)}
                  placeholder="e.g., 350"
                  className="border-[#8b5a3c]/20 focus:border-[#8b5a3c] bg-[#f5f1ec]"
                  required
                />
              </div>
              <div>
                <Label htmlFor="servings">Servings</Label>
                <Input
                  id="servings"
                  type="number"
                  step="0.5"
                  value={servings}
                  onChange={(e) => setServings(e.target.value)}
                  placeholder="1"
                  className="border-[#8b5a3c]/20 focus:border-[#8b5a3c] bg-[#f5f1ec]"
                  required
                />
              </div>
              <Button type="submit" className="w-full bg-[#8b5a3c] hover:bg-[#6b4423]">
                Add to Log
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="pt-6 relative">
        {todayMeals.length === 0 ? (
          <p className="text-center text-[#786f66] py-8">No meals logged today</p>
        ) : (
          <AnimatePresence>
            <div className="space-y-2">
              {todayMeals.map((meal, index) => (
                <motion.div
                  key={meal.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  className="flex items-center justify-between p-3 bg-[#f5f1ec] rounded-lg border border-[#8b5a3c]/10"
                >
                  <div className="flex-1">
                    <p className="text-[#2d2520]">{meal.foodName}</p>
                    <p className="text-sm text-[#786f66]">
                      {meal.servings} serving{meal.servings !== 1 ? 's' : ''} · {meal.calories * meal.servings} cal
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveMeal(meal.id)}
                    className="hover:bg-[#8b5a3c]/10"
                  >
                    <X className="w-4 h-4 text-[#786f66]" />
                  </Button>
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        )}
      </CardContent>
    </Card>
  );
}