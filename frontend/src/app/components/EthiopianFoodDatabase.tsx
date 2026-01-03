import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Search, Plus } from "lucide-react";
import { motion } from "motion/react";
import { TibebPattern } from "./TibebPattern";
import { FoodDetailsModal, FoodWithRecipe } from "./FoodDetailsModal";

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
  recipe: {
    description: string;
    ingredients: string[];
    instructions: string[];
    prepTime?: string;
    cookTime?: string;
  };
}

interface EthiopianFoodDatabaseProps {
  onAddFood: (food: EthiopianFood) => void;
}

const ethiopianFoods: EthiopianFood[] = [
  {
    id: "1",
    name: "Injera with Doro Wat",
    nameAmharic: "እንጀራ ከዶሮ ወጥ ጋር",
    calories: 450,
    protein: 28,
    carbs: 52,
    fat: 12,
    serving: "1 plate (300g)",
    image: "https://images.unsplash.com/flagged/photo-1572644973628-e9be84915d59?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
    recipe: {
      description: "A quintessential Ethiopian dish featuring spicy chicken stew (Doro Wat) served on traditional sourdough flatbread (Injera). This beloved dish is often prepared for special occasions and holidays.",
      prepTime: "30 minutes",
      cookTime: "1 hour",
      ingredients: [
        "1 whole chicken, cut into pieces",
        "3 large onions, finely chopped",
        "4 cloves garlic, minced",
        "2 tbsp fresh ginger, minced",
        "3 tbsp berbere spice blend",
        "1/4 cup niter kibbeh (Ethiopian spiced butter)",
        "2 cups chicken broth",
        "4 hard-boiled eggs",
        "Salt to taste",
        "4-6 pieces of injera"
      ],
      instructions: [
        "In a large pot, dry-roast the onions over medium heat until they release moisture and turn golden brown, stirring frequently (about 15 minutes).",
        "Add the niter kibbeh, garlic, and ginger. Sauté for 2-3 minutes until fragrant.",
        "Stir in the berbere spice and cook for another 2 minutes, adding a splash of water if it gets too dry.",
        "Add the chicken pieces and coat them well with the spice mixture. Cook for 5 minutes.",
        "Pour in the chicken broth, bring to a boil, then reduce heat and simmer for 45 minutes until chicken is tender.",
        "Add the hard-boiled eggs (make small cuts in them first) and simmer for 10 more minutes.",
        "Serve hot on a large platter lined with injera, with extra injera on the side."
      ]
    }
  },
  {
    id: "2",
    name: "Kitfo",
    nameAmharic: "ክትፎ",
    calories: 380,
    protein: 32,
    carbs: 8,
    fat: 24,
    serving: "1 serving (200g)",
    image: "https://images.unsplash.com/photo-1647998270792-69ac80570183?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
    recipe: {
      description: "Traditional Ethiopian minced raw beef dish seasoned with mitmita (chili powder) and niter kibbeh. It's often served with ayib (Ethiopian cottage cheese) and gomen (collard greens).",
      prepTime: "15 minutes",
      cookTime: "0 minutes (or 5 if cooked)",
      ingredients: [
        "500g premium lean beef, finely minced",
        "1/4 cup niter kibbeh (Ethiopian spiced butter)",
        "2 tbsp mitmita spice blend",
        "1/2 tsp cardamom powder",
        "Salt to taste",
        "Ayib (Ethiopian cottage cheese) for serving",
        "Injera for serving"
      ],
      instructions: [
        "Ensure the beef is very fresh and of the highest quality. Mince it very finely or ask your butcher to do this.",
        "If serving raw (traditional), keep the meat refrigerated until the last moment.",
        "Warm the niter kibbeh until just melted (not hot).",
        "Mix the minced beef with the warm niter kibbeh, mitmita, cardamom, and salt.",
        "For 'leb leb' style, briefly warm the mixture in a pan for 1-2 minutes. For traditional raw, skip this step.",
        "Serve immediately with ayib, gomen, and injera on the side."
      ]
    }
  },
  {
    id: "3",
    name: "Tibs",
    nameAmharic: "ጥብስ",
    calories: 320,
    protein: 26,
    carbs: 12,
    fat: 18,
    serving: "1 serving (250g)",
    image: "https://images.unsplash.com/photo-1765338915553-6e02fe63ff4f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
    recipe: {
      description: "Sautéed meat dish with vegetables, seasoned with berbere and served sizzling hot. A popular dish in Ethiopian restaurants, often brought to the table on a clay plate.",
      prepTime: "20 minutes",
      cookTime: "15 minutes",
      ingredients: [
        "500g beef or lamb, cut into cubes",
        "2 large onions, roughly chopped",
        "3 cloves garlic, minced",
        "2 fresh tomatoes, diced",
        "2 jalapeño peppers, sliced",
        "2 tbsp berbere spice",
        "3 tbsp vegetable oil or niter kibbeh",
        "Fresh rosemary sprigs",
        "Salt and pepper to taste"
      ],
      instructions: [
        "Heat oil or niter kibbeh in a large skillet or wok over high heat.",
        "Add the meat cubes and sear them on all sides until browned (about 5 minutes).",
        "Add the onions and cook until they start to soften (3-4 minutes).",
        "Stir in the garlic, berbere, and rosemary. Cook for 1 minute until fragrant.",
        "Add the tomatoes and peppers. Cook for another 5 minutes, stirring occasionally.",
        "Season with salt and pepper to taste.",
        "Serve immediately while hot, preferably on a sizzling clay plate with injera."
      ]
    }
  },
  {
    id: "4",
    name: "Shiro Wat",
    nameAmharic: "ሽሮ ወጥ",
    calories: 280,
    protein: 14,
    carbs: 38,
    fat: 8,
    serving: "1 cup (200g)",
    image: "https://images.unsplash.com/photo-1596235502219-a1c80d8be60c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
    recipe: {
      description: "A creamy, flavorful chickpea or bean flour stew that's a staple of Ethiopian cuisine. Rich in protein and perfect for vegetarians, it's commonly eaten during fasting periods.",
      prepTime: "10 minutes",
      cookTime: "25 minutes",
      ingredients: [
        "1 cup shiro powder (ground chickpeas or fava beans)",
        "2 large onions, finely chopped",
        "3 cloves garlic, minced",
        "2 tbsp tomato paste",
        "3 tbsp niter kibbeh or vegetable oil",
        "1 tsp berbere spice",
        "3 cups water or vegetable broth",
        "Salt to taste",
        "Fresh jalapeño (optional)"
      ],
      instructions: [
        "In a large pot, sauté the onions in niter kibbeh over medium heat until golden (about 10 minutes).",
        "Add garlic and cook for 1 minute until fragrant.",
        "Stir in the tomato paste and berbere, cooking for 2 minutes.",
        "In a bowl, mix the shiro powder with 1 cup of cold water until smooth and lump-free.",
        "Add the remaining 2 cups of water to the pot and bring to a simmer.",
        "Slowly pour in the shiro mixture while stirring continuously to prevent lumps.",
        "Simmer for 15 minutes, stirring frequently, until the mixture thickens to a creamy consistency.",
        "Season with salt and serve hot with injera."
      ]
    }
  },
  {
    id: "5",
    name: "Beyainatu (Vegetarian Combo)",
    nameAmharic: "በያይነቱ",
    calories: 350,
    protein: 12,
    carbs: 62,
    fat: 6,
    serving: "1 plate (400g)",
    image: "https://images.unsplash.com/photo-1633980990916-74317cba1ea3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
    recipe: {
      description: "A beautiful combination platter featuring various vegetarian dishes served on injera. This colorful array typically includes misir wat, gomen, shiro, and other vegetable preparations.",
      prepTime: "30 minutes",
      cookTime: "45 minutes",
      ingredients: [
        "1 cup red lentils (for misir wat)",
        "2 cups collard greens, chopped (for gomen)",
        "1 cup yellow split peas (for kik alicha)",
        "2 potatoes, cubed (for dinich)",
        "Berbere spice blend",
        "Turmeric",
        "Niter kibbeh or vegetable oil",
        "Onions, garlic, ginger",
        "Salt to taste"
      ],
      instructions: [
        "Prepare each dish separately following their individual recipes.",
        "For misir wat: Cook lentils with berbere, onions, and garlic until thick.",
        "For gomen: Sauté collard greens with onions, garlic, and ginger until tender.",
        "For kik alicha: Cook split peas with turmeric, onions, and garlic.",
        "For dinich: Sauté cubed potatoes with turmeric until tender.",
        "Arrange all dishes in separate portions on a large platter lined with injera.",
        "Serve with additional injera on the side for scooping."
      ]
    }
  },
  {
    id: "6",
    name: "Gomen (Collard Greens)",
    nameAmharic: "ጎመን",
    calories: 120,
    protein: 6,
    carbs: 18,
    fat: 3,
    serving: "1 cup (150g)",
    image: "https://images.unsplash.com/photo-1633980990916-74317cba1ea3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
    recipe: {
      description: "A simple yet flavorful Ethiopian side dish of collard greens sautéed with onions, garlic, and spices. Healthy, nutritious, and commonly served as part of a vegetarian platter.",
      prepTime: "15 minutes",
      cookTime: "30 minutes",
      ingredients: [
        "1 large bunch collard greens, chopped",
        "1 large onion, finely chopped",
        "4 cloves garlic, minced",
        "2 tbsp fresh ginger, minced",
        "2 tbsp vegetable oil or niter kibbeh",
        "1/2 tsp turmeric (optional)",
        "Salt and pepper to taste",
        "1/4 cup water"
      ],
      instructions: [
        "Wash the collard greens thoroughly and chop into bite-sized pieces, removing tough stems.",
        "In a large pot, heat the oil over medium heat and sauté the onions until softened.",
        "Add the garlic and ginger, cooking for 1-2 minutes until fragrant.",
        "Add the chopped collard greens and stir to coat with the onion mixture.",
        "Add water, cover, and cook for 20-25 minutes until the greens are tender, stirring occasionally.",
        "Season with salt, pepper, and turmeric if using.",
        "Serve warm as a side dish with injera or other Ethiopian mains."
      ]
    }
  },
  {
    id: "7",
    name: "Misir Wat (Red Lentils)",
    nameAmharic: "ምስር ወጥ",
    calories: 240,
    protein: 16,
    carbs: 36,
    fat: 4,
    serving: "1 cup (200g)",
    image: "https://images.unsplash.com/photo-1596235502219-a1c80d8be60c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
    recipe: {
      description: "Spicy red lentil stew that's a staple in Ethiopian cuisine. Rich in protein and flavor, seasoned with berbere spice for a complex, warming taste.",
      prepTime: "10 minutes",
      cookTime: "35 minutes",
      ingredients: [
        "1 cup red lentils, rinsed",
        "2 large onions, finely chopped",
        "3 cloves garlic, minced",
        "1 tbsp fresh ginger, minced",
        "2 tbsp berbere spice",
        "2 tbsp tomato paste",
        "3 tbsp niter kibbeh or vegetable oil",
        "3 cups water or vegetable broth",
        "Salt to taste"
      ],
      instructions: [
        "In a large pot, sauté the onions in niter kibbeh over medium heat until golden brown (about 10 minutes).",
        "Add the garlic and ginger, cooking for 2 minutes until fragrant.",
        "Stir in the berbere spice and tomato paste, cooking for another 2 minutes.",
        "Add the rinsed lentils and stir to coat with the spice mixture.",
        "Pour in the water or broth and bring to a boil.",
        "Reduce heat and simmer uncovered for 25-30 minutes, stirring occasionally, until lentils are soft and the stew has thickened.",
        "Season with salt to taste and serve hot with injera."
      ]
    }
  },
  {
    id: "8",
    name: "Injera (Plain)",
    nameAmharic: "እንጀራ",
    calories: 170,
    protein: 6,
    carbs: 34,
    fat: 1,
    serving: "1 large piece",
    image: "https://images.unsplash.com/photo-1765338915553-6e02fe63ff4f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
    recipe: {
      description: "Traditional Ethiopian sourdough flatbread with a unique spongy texture. Made from teff flour and fermented for several days, it serves as both plate and utensil in Ethiopian dining.",
      prepTime: "10 minutes (plus 3 days fermentation)",
      cookTime: "2 minutes per injera",
      ingredients: [
        "2 cups teff flour",
        "3 cups water",
        "1/2 tsp salt",
        "Additional water for consistency"
      ],
      instructions: [
        "Mix teff flour with water in a large bowl until smooth. The consistency should be like pancake batter.",
        "Cover with a clean cloth and let ferment at room temperature for 3 days, stirring once daily. It should develop a sour smell.",
        "After fermentation, the mixture will separate. Pour off the water on top and add fresh water to achieve a thin, pourable consistency.",
        "Heat a non-stick or clay mitad (traditional injera pan) over medium-high heat.",
        "Pour batter in a spiral pattern from outside to inside, covering the entire pan surface.",
        "Cover and cook for 1-2 minutes until holes form on the surface and edges lift easily.",
        "Do not flip. Remove and let cool. Repeat with remaining batter.",
        "Stack injeras and cover with a clean cloth until ready to serve."
      ]
    }
  },
  {
    id: "9",
    name: "Firfir",
    nameAmharic: "ፍርፍር",
    calories: 310,
    protein: 18,
    carbs: 42,
    fat: 8,
    serving: "1 plate (250g)",
    image: "https://images.unsplash.com/photo-1765338915553-6e02fe63ff4f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
    recipe: {
      description: "A breakfast favorite made from shredded injera mixed with berbere sauce. It's a perfect way to use leftover injera, creating a flavorful and filling morning meal.",
      prepTime: "10 minutes",
      cookTime: "15 minutes",
      ingredients: [
        "4-5 pieces leftover injera, torn into bite-sized pieces",
        "2 large onions, chopped",
        "3 cloves garlic, minced",
        "2 tbsp berbere spice",
        "2 tbsp tomato paste",
        "3 tbsp niter kibbeh",
        "1 cup water or broth",
        "Salt to taste",
        "Optional: 2 eggs"
      ],
      instructions: [
        "Heat niter kibbeh in a large pan over medium heat.",
        "Add onions and sauté until golden brown (about 8 minutes).",
        "Add garlic and cook for 1 minute until fragrant.",
        "Stir in berbere spice and tomato paste, cooking for 2 minutes.",
        "Add water or broth and bring to a simmer.",
        "Add the torn injera pieces and mix well until they absorb the sauce.",
        "Cook for 3-4 minutes, stirring gently to prevent sticking.",
        "Optional: Make two wells in the mixture and crack eggs into them. Cover and cook until eggs are set.",
        "Serve hot, traditionally for breakfast."
      ]
    }
  },
  {
    id: "10",
    name: "Ful (Fava Bean Stew)",
    nameAmharic: "ፉል",
    calories: 220,
    protein: 12,
    carbs: 32,
    fat: 5,
    serving: "1 bowl (200g)",
    image: "https://images.unsplash.com/photo-1596235502219-a1c80d8be60c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
    recipe: {
      description: "A hearty fava bean stew commonly enjoyed for breakfast. Seasoned with cumin and topped with vegetables, it's nutritious, filling, and pairs perfectly with fresh bread.",
      prepTime: "10 minutes (if using canned beans)",
      cookTime: "20 minutes",
      ingredients: [
        "2 cups cooked fava beans (or 2 cans, drained)",
        "1 large onion, finely chopped",
        "3 cloves garlic, minced",
        "2 tomatoes, diced",
        "1 jalapeño pepper, chopped",
        "2 tbsp olive oil",
        "1 tsp cumin powder",
        "1/2 cup water",
        "Salt and pepper to taste",
        "Fresh lemon juice",
        "Chopped parsley for garnish"
      ],
      instructions: [
        "Heat olive oil in a pot over medium heat.",
        "Add onions and sauté until softened (about 5 minutes).",
        "Add garlic and cook for 1 minute until fragrant.",
        "Add the fava beans and water. Mash about half of the beans with a potato masher.",
        "Stir in cumin, tomatoes, and jalapeño.",
        "Simmer for 15 minutes, adding more water if needed to reach desired consistency.",
        "Season with salt, pepper, and a squeeze of lemon juice.",
        "Garnish with fresh parsley and serve hot with bread or injera."
      ]
    }
  },
];

export function EthiopianFoodDatabase({ onAddFood }: EthiopianFoodDatabaseProps) {
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
      <Card className="w-full border-[#8b5a3c]/20 shadow-lg relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <TibebPattern className="w-full h-full text-[#8b5a3c]" />
        </div>
        <CardHeader className="relative border-b border-[#8b5a3c]/10">
          <div className="absolute bottom-0 left-0 right-0 h-2">
            <TibebPattern className="w-full h-full text-[#8b5a3c]" variant="border" />
          </div>
          <CardTitle className="text-[#2d2520]">Ethiopian Food Database</CardTitle>
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#786f66]" />
            <Input
              placeholder="Search Ethiopian foods..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-[#8b5a3c]/20 focus:border-[#8b5a3c] bg-[#f5f1ec]"
            />
          </div>
        </CardHeader>
        <CardContent className="pt-6 relative">
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
                  <div className="absolute bottom-2 left-2 right-2">
                    <p className="text-white font-semibold text-sm">{food.name}</p>
                    <p className="text-white/90 text-xs">{food.nameAmharic}</p>
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