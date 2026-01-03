import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { MealEntry } from "./MealLogger";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Calendar, TrendingUp, Utensils, Target } from "lucide-react";
import { motion } from "motion/react";
import { TibebPattern } from "./TibebPattern";

interface StatisticsProps {
  meals: MealEntry[];
  calorieTarget: number;
}

export function Statistics({ meals, calorieTarget }: StatisticsProps) {
  const weekData = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    const weekStats = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dayMeals = meals.filter(meal => {
        const mealDate = new Date(meal.timestamp);
        return mealDate.toDateString() === date.toDateString();
      });

      const totalCalories = dayMeals.reduce((sum, meal) => sum + (meal.calories * meal.servings), 0);
      
      weekStats.push({
        day: days[date.getDay()],
        calories: totalCalories,
        target: calorieTarget,
        meals: dayMeals.length,
      });
    }

    return weekStats;
  }, [meals, calorieTarget]);

  const topFoods = useMemo(() => {
    const foodCount: { [key: string]: { count: number; calories: number } } = {};
    
    meals.forEach(meal => {
      if (!foodCount[meal.foodName]) {
        foodCount[meal.foodName] = { count: 0, calories: 0 };
      }
      foodCount[meal.foodName].count += meal.servings;
      foodCount[meal.foodName].calories += meal.calories * meal.servings;
    });

    return Object.entries(foodCount)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [meals]);

  const averageCalories = useMemo(() => {
    if (weekData.length === 0) return 0;
    const total = weekData.reduce((sum, day) => sum + day.calories, 0);
    return Math.round(total / weekData.length);
  }, [weekData]);

  const totalMeals = useMemo(() => {
    return weekData.reduce((sum, day) => sum + day.meals, 0);
  }, [weekData]);

  const chartColors = ['#8b5a3c', '#c89968', '#d4a574', '#b8654d', '#a67c52'];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0 }}
        >
          <Card className="border-[#8b5a3c]/20 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 opacity-10">
              <TibebPattern className="w-full h-full text-[#8b5a3c]" variant="subtle" />
            </div>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-[#786f66]">Avg Daily Calories</CardTitle>
              <TrendingUp className="w-4 h-4 text-[#8b5a3c]" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[#8b5a3c]">{averageCalories}</div>
              <p className="text-xs text-[#786f66] mt-1">
                {averageCalories > calorieTarget ? '+' : ''}{averageCalories - calorieTarget} from target
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="border-[#8b5a3c]/20 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 opacity-10">
              <TibebPattern className="w-full h-full text-[#c89968]" variant="subtle" />
            </div>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-[#786f66]">Total Meals</CardTitle>
              <Utensils className="w-4 h-4 text-[#c89968]" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[#c89968]">{totalMeals}</div>
              <p className="text-xs text-[#786f66] mt-1">Last 7 days</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card className="border-[#8b5a3c]/20 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 opacity-10">
              <TibebPattern className="w-full h-full text-[#d4a574]" variant="subtle" />
            </div>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-[#786f66]">Daily Target</CardTitle>
              <Target className="w-4 h-4 text-[#d4a574]" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[#d4a574]">{calorieTarget}</div>
              <p className="text-xs text-[#786f66] mt-1">Calories per day</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card className="border-[#8b5a3c]/20 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 opacity-10">
              <TibebPattern className="w-full h-full text-[#b8654d]" variant="subtle" />
            </div>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-[#786f66]">Tracking Streak</CardTitle>
              <Calendar className="w-4 h-4 text-[#b8654d]" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[#b8654d]">7</div>
              <p className="text-xs text-[#786f66] mt-1">Days tracked</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Calories Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <Card className="border-[#8b5a3c]/20 shadow-lg relative overflow-hidden">
            <div className="absolute inset-0 opacity-5">
              <TibebPattern className="w-full h-full text-[#8b5a3c]" />
            </div>
            <CardHeader className="relative border-b border-[#8b5a3c]/10">
              <div className="absolute bottom-0 left-0 right-0 h-2">
                <TibebPattern className="w-full h-full text-[#8b5a3c]" variant="border" />
              </div>
              <CardTitle className="text-[#2d2520]">Weekly Calorie Intake</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 relative">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={weekData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e8e1d8" />
                  <XAxis dataKey="day" stroke="#786f66" />
                  <YAxis stroke="#786f66" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #8b5a3c',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="calories" fill="#8b5a3c" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="target" fill="#d4a574" radius={[8, 8, 0, 0]} opacity={0.3} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Calorie Trend Chart */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
        >
          <Card className="border-[#8b5a3c]/20 shadow-lg relative overflow-hidden">
            <div className="absolute inset-0 opacity-5">
              <TibebPattern className="w-full h-full text-[#c89968]" />
            </div>
            <CardHeader className="relative border-b border-[#8b5a3c]/10">
              <div className="absolute bottom-0 left-0 right-0 h-2">
                <TibebPattern className="w-full h-full text-[#c89968]" variant="border" />
              </div>
              <CardTitle className="text-[#2d2520]">Calorie Trend</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 relative">
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={weekData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e8e1d8" />
                  <XAxis dataKey="day" stroke="#786f66" />
                  <YAxis stroke="#786f66" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #c89968',
                      borderRadius: '8px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="calories"
                    stroke="#c89968"
                    strokeWidth={3}
                    dot={{ fill: '#c89968', r: 5 }}
                    activeDot={{ r: 7 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="target"
                    stroke="#8b5a3c"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Top Foods */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.6 }}
      >
        <Card className="border-[#8b5a3c]/20 shadow-lg relative overflow-hidden">
          <div className="absolute inset-0 opacity-5">
            <TibebPattern className="w-full h-full text-[#8b5a3c]" />
          </div>
          <CardHeader className="relative border-b border-[#8b5a3c]/10">
            <div className="absolute bottom-0 left-0 right-0 h-2">
              <TibebPattern className="w-full h-full text-[#8b5a3c]" variant="border" />
            </div>
            <CardTitle className="text-[#2d2520]">Top 5 Foods This Week</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 relative">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                {topFoods.map((food, index) => (
                  <motion.div
                    key={food.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.7 + index * 0.1 }}
                    className="flex items-center justify-between p-4 bg-[#f5f1ec] rounded-lg border border-[#8b5a3c]/10"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
                        style={{ backgroundColor: chartColors[index] }}
                      >
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-[#2d2520]">{food.name}</p>
                        <p className="text-sm text-[#786f66]">
                          {food.count} servings · {food.calories} cal
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {topFoods.length > 0 && (
                <div className="flex items-center justify-center">
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={topFoods}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="calories"
                      >
                        {topFoods.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#ffffff',
                          border: '1px solid #8b5a3c',
                          borderRadius: '8px',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
