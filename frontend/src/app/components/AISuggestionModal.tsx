import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Sparkles, Brain, X } from "lucide-react";
import { motion } from "motion/react";
import { TibebPattern } from "./TibebPattern";
import { Alert, AlertDescription } from "./ui/alert";

interface AISuggestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  remainingCalories: number;
  consumedCalories: number;
}

export function AISuggestionModal({
  isOpen,
  onClose,
  remainingCalories,
  consumedCalories,
}: AISuggestionModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl border-[#8b5a3c]/20">
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <TibebPattern className="w-full h-full text-[#8b5a3c]" />
        </div>

        <DialogHeader className="relative">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-[#8b5a3c] to-[#c89968] rounded-xl flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <DialogTitle className="text-2xl">AI-Powered Meal Suggestions</DialogTitle>
          </div>
          <DialogDescription className="text-[#786f66]">
            Get personalized meal recommendations based on your dietary goals and eating patterns
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 relative">
          {/* Current Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-[#f5f1ec] to-white p-6 rounded-lg border border-[#8b5a3c]/10"
          >
            <h3 className="font-semibold text-[#2d2520] mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#8b5a3c]" />
              Your Current Status
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-white rounded-lg border border-[#8b5a3c]/10">
                <div className="text-3xl font-bold text-[#8b5a3c]">{consumedCalories}</div>
                <div className="text-sm text-[#786f66] mt-1">Calories Consumed</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg border border-[#8b5a3c]/10">
                <div className="text-3xl font-bold text-[#8b5a3c]">{remainingCalories}</div>
                <div className="text-sm text-[#786f66] mt-1">Calories Remaining</div>
              </div>
            </div>
          </motion.div>

          {/* API Integration Notice */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Alert className="border-[#8b5a3c]/20 bg-gradient-to-br from-[#fff9f0] to-white">
              <Brain className="h-5 w-5 text-[#8b5a3c]" />
              <AlertDescription className="text-[#2d2520] ml-2">
                <div className="space-y-3">
                  <p className="font-semibold">
                    🚀 Gemini AI Integration Ready
                  </p>
                  <p className="text-sm text-[#786f66]">
                    This feature will be powered by Google's Gemini API to provide intelligent meal suggestions based on:
                  </p>
                  <ul className="text-sm text-[#786f66] space-y-2 ml-4">
                    <li className="flex items-start gap-2">
                      <span className="text-[#8b5a3c] mt-1">•</span>
                      <span>Your remaining calorie budget for the day</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#8b5a3c] mt-1">•</span>
                      <span>Your recent eating patterns and preferences</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#8b5a3c] mt-1">•</span>
                      <span>Nutritional balance and variety in your diet</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#8b5a3c] mt-1">•</span>
                      <span>Both Ethiopian and international cuisine options</span>
                    </li>
                  </ul>
                </div>
              </AlertDescription>
            </Alert>
          </motion.div>

          {/* Implementation Guide */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-[#f5f1ec] p-6 rounded-lg border border-[#8b5a3c]/10"
          >
            <h4 className="font-semibold text-[#2d2520] mb-3">Implementation Notes:</h4>
            <div className="space-y-2 text-sm text-[#786f66]">
              <p>📝 The AI will analyze:</p>
              <ul className="ml-6 space-y-1">
                <li>• Current calorie data: {consumedCalories} consumed, {remainingCalories} remaining</li>
                <li>• Your meal history and eating patterns</li>
                <li>• Time of day and meal timing</li>
                <li>• Nutritional gaps in your daily intake</li>
              </ul>
              <p className="mt-4 text-xs italic">
                Connect your Gemini API key to activate personalized AI suggestions. The integration point is ready in this component.
              </p>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex gap-3"
          >
            <Button
              onClick={onClose}
              className="flex-1 bg-[#8b5a3c] hover:bg-[#6b4423] text-white"
            >
              Got It
            </Button>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
