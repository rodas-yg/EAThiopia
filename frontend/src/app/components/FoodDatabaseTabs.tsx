import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { EthiopianFoodDatabase, EthiopianFood } from "./EthiopianFoodDatabase";
import { InternationalFoodDatabase, InternationalFood } from "./InternationalFoodDatabase";
import { motion } from "motion/react";

interface FoodDatabaseTabsProps {
  onAddFood: (food: EthiopianFood | InternationalFood) => void;
}

export function FoodDatabaseTabs({ onAddFood }: FoodDatabaseTabsProps) {
  return (
    <Tabs defaultValue="ethiopian" className="w-full">
      <TabsList className="grid w-full grid-cols-2 bg-[#f5f1ec] border border-[#8b5a3c]/20">
        <TabsTrigger 
          value="ethiopian" 
          className="data-[state=active]:bg-[#8b5a3c] data-[state=active]:text-white"
        >
          Ethiopian Cuisine
        </TabsTrigger>
        <TabsTrigger 
          value="international"
          className="data-[state=active]:bg-[#8b5a3c] data-[state=active]:text-white"
        >
          International
        </TabsTrigger>
      </TabsList>
      <TabsContent value="ethiopian" className="mt-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <EthiopianFoodDatabase onAddFood={onAddFood} />
        </motion.div>
      </TabsContent>
      <TabsContent value="international" className="mt-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <InternationalFoodDatabase onAddFood={onAddFood} />
        </motion.div>
      </TabsContent>
    </Tabs>
  );
}
