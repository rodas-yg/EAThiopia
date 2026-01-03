import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Search, Plus, AlertCircle } from "lucide-react";
import { motion } from "motion/react";
import { TibebPattern } from "./TibebPattern";
import { FoodDetailsModal, FoodWithRecipe } from "./FoodDetailsModal";
import { Alert, AlertDescription } from "./ui/alert";

export interface InternationalFood {
  id: string;
  name: string;
  cuisine: string;
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

interface InternationalFoodDatabaseProps {
  onAddFood: (food: InternationalFood) => void;
}

const internationalFoods: InternationalFood[] = [
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
      description: "Classic Italian pizza with tomato sauce, fresh mozzarella, basil, and olive oil on a thin crust. Simple, fresh, and absolutely delicious.",
      prepTime: "20 minutes (plus 1 hour rising)",
      cookTime: "12 minutes",
      ingredients: [
        "Pizza dough (250g)",
        "1/2 cup tomato sauce",
        "200g fresh mozzarella cheese",
        "Fresh basil leaves",
        "2 tbsp olive oil",
        "Salt to taste",
        "Flour for dusting"
      ],
      instructions: [
        "Preheat oven to 475°F (245°C) with a pizza stone if available.",
        "Roll out the pizza dough on a floured surface to desired thickness.",
        "Spread tomato sauce evenly over the dough, leaving a border for the crust.",
        "Tear the mozzarella into pieces and distribute evenly over the sauce.",
        "Drizzle with olive oil and sprinkle with salt.",
        "Bake for 10-12 minutes until the crust is golden and cheese is bubbling.",
        "Remove from oven, top with fresh basil leaves, and serve immediately."
      ]
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
      description: "Tender grilled chicken glazed with a sweet and savory teriyaki sauce. Served with steamed rice and vegetables for a balanced meal.",
      prepTime: "15 minutes (plus 30 minutes marinating)",
      cookTime: "15 minutes",
      ingredients: [
        "500g chicken thighs, boneless",
        "1/4 cup soy sauce",
        "2 tbsp mirin",
        "2 tbsp sake or water",
        "2 tbsp sugar",
        "1 tbsp honey",
        "2 cloves garlic, minced",
        "1 tsp fresh ginger, grated",
        "1 tbsp vegetable oil",
        "Sesame seeds for garnish",
        "Green onions, sliced"
      ],
      instructions: [
        "Mix soy sauce, mirin, sake, sugar, honey, garlic, and ginger in a bowl.",
        "Add chicken and marinate for at least 30 minutes.",
        "Heat oil in a large pan over medium-high heat.",
        "Remove chicken from marinade (reserve marinade) and cook for 5-6 minutes per side.",
        "Pour reserved marinade into the pan and simmer until it thickens into a glaze.",
        "Coat chicken with the glaze and cook for 2 more minutes.",
        "Slice chicken, garnish with sesame seeds and green onions, and serve with rice."
      ]
    }
  },
  {
    id: "int-3",
    name: "Pad Thai",
    cuisine: "Thai",
    calories: 375,
    protein: 18,
    carbs: 52,
    fat: 12,
    serving: "1 plate (300g)",
    image: "https://images.unsplash.com/photo-1559314809-0d155014e29e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
    recipe: {
      description: "Thailand's most famous street food - stir-fried rice noodles with eggs, tofu, shrimp, and a tangy tamarind sauce. Garnished with peanuts, lime, and bean sprouts.",
      prepTime: "20 minutes",
      cookTime: "15 minutes",
      ingredients: [
        "200g rice noodles",
        "150g shrimp, peeled",
        "100g firm tofu, cubed",
        "2 eggs",
        "3 tbsp tamarind paste",
        "2 tbsp fish sauce",
        "2 tbsp palm sugar",
        "3 cloves garlic, minced",
        "1 cup bean sprouts",
        "3 tbsp crushed peanuts",
        "2 green onions, chopped",
        "Lime wedges",
        "Chili flakes (optional)"
      ],
      instructions: [
        "Soak rice noodles in warm water for 30 minutes until soft, then drain.",
        "Mix tamarind paste, fish sauce, and palm sugar in a bowl.",
        "Heat oil in a wok over high heat. Stir-fry garlic until fragrant.",
        "Add shrimp and tofu, cooking until shrimp turns pink.",
        "Push ingredients to the side, crack eggs into the wok, and scramble.",
        "Add noodles and sauce mixture, tossing everything together.",
        "Add bean sprouts and green onions, stir-fry for 2 minutes.",
        "Serve topped with crushed peanuts, lime wedges, and chili flakes."
      ]
    }
  },
  {
    id: "int-4",
    name: "Chicken Burrito Bowl",
    cuisine: "Mexican",
    calories: 520,
    protein: 35,
    carbs: 58,
    fat: 16,
    serving: "1 bowl (400g)",
    image: "https://images.unsplash.com/photo-1546793665-c74683f339c1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
    recipe: {
      description: "A deconstructed burrito served in a bowl with cilantro-lime rice, seasoned chicken, black beans, corn, salsa, and fresh toppings.",
      prepTime: "20 minutes",
      cookTime: "25 minutes",
      ingredients: [
        "300g chicken breast",
        "1 cup white rice",
        "1 can black beans, drained",
        "1 cup corn kernels",
        "1 lime, juiced",
        "Fresh cilantro, chopped",
        "1 tsp cumin",
        "1 tsp chili powder",
        "1 tsp paprika",
        "Salsa, sour cream, cheese for topping",
        "Lettuce, diced tomatoes, avocado"
      ],
      instructions: [
        "Cook rice according to package directions. Mix with lime juice and cilantro when done.",
        "Season chicken with cumin, chili powder, paprika, salt, and pepper.",
        "Grill or pan-fry chicken for 6-7 minutes per side until cooked through. Slice.",
        "Warm black beans and corn in a pan with a pinch of cumin.",
        "Assemble bowls: start with rice, add beans, corn, and sliced chicken.",
        "Top with lettuce, tomatoes, avocado, salsa, sour cream, and cheese.",
        "Serve with extra lime wedges on the side."
      ]
    }
  },
  {
    id: "int-5",
    name: "Butter Chicken",
    cuisine: "Indian",
    calories: 438,
    protein: 28,
    carbs: 18,
    fat: 28,
    serving: "1 serving (300g)",
    image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
    recipe: {
      description: "Rich and creamy Indian curry made with tender chicken in a tomato-based sauce with butter and cream. Perfectly spiced and absolutely indulgent.",
      prepTime: "20 minutes (plus 2 hours marinating)",
      cookTime: "35 minutes",
      ingredients: [
        "500g chicken thighs, cubed",
        "1 cup yogurt",
        "2 tsp garam masala",
        "1 tsp turmeric",
        "1 tsp chili powder",
        "4 tbsp butter",
        "1 onion, finely chopped",
        "4 cloves garlic, minced",
        "1 tbsp ginger, grated",
        "1 can (400g) crushed tomatoes",
        "1/2 cup heavy cream",
        "Fresh cilantro",
        "Salt to taste"
      ],
      instructions: [
        "Marinate chicken in yogurt, 1 tsp garam masala, turmeric, and chili powder for 2 hours.",
        "Heat 2 tbsp butter in a large pan and cook chicken until browned. Set aside.",
        "In the same pan, add remaining butter and sauté onions until golden.",
        "Add garlic and ginger, cooking for 1 minute until fragrant.",
        "Stir in crushed tomatoes and remaining garam masala. Simmer for 10 minutes.",
        "Blend the sauce until smooth, then return to the pan.",
        "Add chicken and cream, simmering for 15 minutes until chicken is cooked through.",
        "Garnish with cilantro and serve with naan or basmati rice."
      ]
    }
  },
  {
    id: "int-6",
    name: "Greek Salad",
    cuisine: "Greek",
    calories: 215,
    protein: 8,
    carbs: 14,
    fat: 15,
    serving: "1 large bowl (250g)",
    image: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
    recipe: {
      description: "Fresh and vibrant Mediterranean salad with tomatoes, cucumbers, olives, feta cheese, and a simple olive oil dressing.",
      prepTime: "15 minutes",
      cookTime: "0 minutes",
      ingredients: [
        "3 large tomatoes, cut into wedges",
        "1 cucumber, sliced",
        "1 red onion, thinly sliced",
        "1/2 cup Kalamata olives",
        "150g feta cheese, cubed",
        "1/4 cup extra virgin olive oil",
        "2 tbsp red wine vinegar",
        "1 tsp dried oregano",
        "Salt and pepper to taste",
        "Fresh mint leaves (optional)"
      ],
      instructions: [
        "In a large bowl, combine tomatoes, cucumber, and red onion.",
        "Add Kalamata olives and feta cheese.",
        "In a small bowl, whisk together olive oil, red wine vinegar, oregano, salt, and pepper.",
        "Pour dressing over the salad and toss gently to combine.",
        "Let sit for 5 minutes to allow flavors to meld.",
        "Garnish with fresh mint leaves if desired and serve immediately."
      ]
    }
  },
  {
    id: "int-7",
    name: "Beef Pho",
    cuisine: "Vietnamese",
    calories: 390,
    protein: 28,
    carbs: 42,
    fat: 12,
    serving: "1 bowl (450g)",
    image: "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
    recipe: {
      description: "Aromatic Vietnamese noodle soup with beef, rice noodles, and a flavorful broth infused with star anise, cinnamon, and ginger. A comforting and nourishing meal.",
      prepTime: "30 minutes",
      cookTime: "2 hours",
      ingredients: [
        "1 kg beef bones",
        "300g beef sirloin, thinly sliced",
        "200g rice noodles",
        "1 onion, halved",
        "3-inch piece ginger, halved",
        "2 star anise",
        "1 cinnamon stick",
        "3 cloves",
        "2 tbsp fish sauce",
        "Bean sprouts, fresh herbs (cilantro, Thai basil, mint)",
        "Lime wedges, jalapeño slices",
        "Hoisin sauce, sriracha"
      ],
      instructions: [
        "Char onion and ginger over an open flame or under a broiler until blackened.",
        "In a large pot, boil beef bones for 5 minutes, then drain and rinse.",
        "Return bones to the pot with 3 liters of water. Add charred onion, ginger, star anise, cinnamon, and cloves.",
        "Simmer for 2 hours, skimming off any impurities that rise to the surface.",
        "Strain the broth and season with fish sauce and salt.",
        "Cook rice noodles according to package directions.",
        "Divide noodles among bowls, top with raw beef slices.",
        "Pour boiling broth over the beef (it will cook the meat).",
        "Serve with bean sprouts, fresh herbs, lime, jalapeño, hoisin sauce, and sriracha on the side."
      ]
    }
  },
  {
    id: "int-8",
    name: "Caesar Salad",
    cuisine: "American",
    calories: 330,
    protein: 14,
    carbs: 22,
    fat: 22,
    serving: "1 large bowl (300g)",
    image: "https://images.unsplash.com/photo-1546793665-c74683f339c1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
    recipe: {
      description: "Classic Caesar salad with crispy romaine lettuce, crunchy croutons, parmesan cheese, and a creamy garlic dressing.",
      prepTime: "15 minutes",
      cookTime: "10 minutes",
      ingredients: [
        "1 head romaine lettuce, chopped",
        "2 cups bread cubes for croutons",
        "1/2 cup grated parmesan cheese",
        "2 cloves garlic, minced",
        "2 anchovy fillets (optional)",
        "1 egg yolk",
        "1 tbsp Dijon mustard",
        "2 tbsp lemon juice",
        "1/2 cup olive oil",
        "Salt and black pepper"
      ],
      instructions: [
        "Toast bread cubes in the oven at 375°F for 10 minutes until golden and crispy.",
        "For the dressing: blend garlic, anchovies, egg yolk, mustard, and lemon juice.",
        "While blending, slowly drizzle in olive oil until emulsified and creamy.",
        "Season with salt and pepper to taste.",
        "In a large bowl, toss romaine lettuce with the dressing.",
        "Add croutons and half the parmesan, tossing again.",
        "Top with remaining parmesan and extra black pepper. Serve immediately."
      ]
    }
  },
];

export function InternationalFoodDatabase({ onAddFood }: InternationalFoodDatabaseProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFood, setSelectedFood] = useState<InternationalFood | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredFoods = internationalFoods.filter(
    (food) =>
      food.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      food.cuisine.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleFoodClick = (food: InternationalFood) => {
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
          {/* API Integration Notice */}
          <Alert className="border-[#8b5a3c]/20 bg-[#f5f1ec]">
            <AlertCircle className="h-4 w-4 text-[#8b5a3c]" />
            <AlertDescription className="text-[#786f66]">
              Additional foods can be loaded from your CSV file. The API integration placeholder is ready for your custom implementation.
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
                {/* Image */}
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

                {/* Content */}
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
                  <p className="text-xs text-[#786f66] mt-2 text-center">{food.serving}</p>
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
