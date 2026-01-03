import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Progress } from "./ui/progress";
import { motion } from "motion/react";
import { TibebPattern } from "./TibebPattern";

interface CalorieTrackerProps {
  consumed: number;
  target: number;
  remaining: number;
}

export function CalorieTracker({ consumed, target, remaining }: CalorieTrackerProps) {
  const percentage = (consumed / target) * 100;
  const isOverTarget = consumed > target;

  return (
    <Card className="w-full border-[#8b5a3c]/20 shadow-lg relative overflow-hidden">
      <div className="absolute inset-0 opacity-5">
        <TibebPattern className="w-full h-full text-[#8b5a3c]" />
      </div>
      <CardHeader className="relative border-b border-[#8b5a3c]/10">
        <div className="absolute bottom-0 left-0 right-0 h-2">
          <TibebPattern className="w-full h-full text-[#8b5a3c]" variant="border" />
        </div>
        <CardTitle className="text-[#2d2520]">Daily Calorie Goal</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-6 relative">
        <div className="flex justify-between items-center">
          <motion.div
            className="text-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
          >
            <div className="text-3xl font-bold text-[#8b5a3c]">{consumed}</div>
            <div className="text-sm text-[#786f66]">Consumed</div>
          </motion.div>
          <motion.div
            className="text-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
          >
            <div className="text-3xl font-bold text-[#c89968]">{target}</div>
            <div className="text-sm text-[#786f66]">Target</div>
          </motion.div>
          <motion.div
            className="text-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.3 }}
          >
            <div className={`text-3xl font-bold ${isOverTarget ? 'text-[#b84a3e]' : 'text-[#b8654d]'}`}>
              {remaining}
            </div>
            <div className="text-sm text-[#786f66]">Remaining</div>
          </motion.div>
        </div>
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          style={{ transformOrigin: "left" }}
        >
          <Progress value={Math.min(percentage, 100)} className="h-3" />
        </motion.div>
        {isOverTarget && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-[#b84a3e] text-center"
          >
            You've exceeded your daily target by {consumed - target} calories
          </motion.p>
        )}
      </CardContent>
    </Card>
  );
}