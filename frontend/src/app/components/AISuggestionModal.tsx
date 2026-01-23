import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea"; 
import { Sparkles, Brain, Loader2, Send, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { TibebPattern } from "./TibebPattern";
import { getNutritionAdvice, AIAdviceResponse } from "../../services/aiService";

interface AISuggestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  remainingCalories: number;
  consumedCalories: number;
  userId: string; 
}

export function AISuggestionModal({
  isOpen,
  onClose,
  remainingCalories,
  consumedCalories,
  userId,
}: AISuggestionModalProps) {
  const [loading, setLoading] = useState(false);
  const [question, setQuestion] = useState("");
  const [advice, setAdvice] = useState<AIAdviceResponse | null>(null);
  const [error, setError] = useState("");

  const handleGetAdvice = async () => {
    if (!userId) {
      setError("User ID missing. Try refreshing the page.");
      return;
    }
    setLoading(true);
    setError("");
    setAdvice(null);

    const data = await getNutritionAdvice(userId, question);

    if (data) {
      setAdvice(data);
    } else {
      setError("Unable to connect to AI. Please check your connection.");
    }
    setLoading(false);
  };

  const resetModal = () => {
    setAdvice(null);
    setQuestion("");
    setError("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl border-[#8b5a3c]/20 max-h-[85vh] overflow-y-auto">
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <TibebPattern className="w-full h-full text-[#8b5a3c]" />
        </div>

        <DialogHeader className="relative">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-[#8b5a3c] to-[#c89968] rounded-xl flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <DialogTitle className="text-2xl text-[#2d2520]">AI Nutrition Assistant</DialogTitle>
          </div>
          <DialogDescription className="text-[#786f66]">
            Get personalized insights or ask specific diet questions.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 relative mt-2">
          
          <div className="bg-[#f5f1ec] p-4 rounded-lg border border-[#8b5a3c]/10 flex justify-between px-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-[#8b5a3c]">{consumedCalories}</div>
                <div className="text-xs text-[#786f66] font-medium uppercase tracking-wide">Consumed</div>
              </div>
              <div className="h-10 w-px bg-[#8b5a3c]/20 mx-4" />
              <div className="text-center">
                <div className="text-2xl font-bold text-[#8b5a3c]">{remainingCalories}</div>
                <div className="text-xs text-[#786f66] font-medium uppercase tracking-wide">Remaining</div>
              </div>
          </div>

          <AnimatePresence mode="wait">
            {!advice ? (
              <motion.div
                key="input"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#2d2520] flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#8b5a3c]" />
                    Ask a question (Optional)
                  </label>
                  <Textarea
                    placeholder="e.g. How can I hit my protein goal with Ethiopian food?"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    className="min-h-[100px] border-[#8b5a3c]/20 focus:ring-[#8b5a3c] resize-none"
                  />
                </div>

                <Button
                  onClick={handleGetAdvice}
                  disabled={loading}
                  className="w-full bg-[#8b5a3c] hover:bg-[#6b4423] text-white h-12 text-lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-5 w-5" />
                      {question.trim() ? "Ask AI" : "Generate Daily Summary"}
                    </>
                  )}
                </Button>
                
                {error && (
                  <div className="p-3 bg-red-50 text-red-600 rounded text-center text-sm border border-red-100">
                    {error}
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-lg">
                  <h4 className="font-bold text-blue-900 text-xs mb-2 uppercase tracking-wider flex items-center gap-2">
                    <Brain className="w-3 h-3" /> Analysis
                  </h4>
                  <p className="text-blue-900 text-sm leading-relaxed">{advice.analysis}</p>
                </div>

                {advice.answer_to_question && (
                  <div className="p-4 bg-purple-50/50 border border-purple-100 rounded-lg">
                    <h4 className="font-bold text-purple-900 text-xs mb-2 uppercase tracking-wider flex items-center gap-2">
                      <Send className="w-3 h-3" /> Your Answer
                    </h4>
                    <p className="text-purple-900 text-sm leading-relaxed">{advice.answer_to_question}</p>
                  </div>
                )}

                <div className="p-4 bg-green-50/50 border border-green-100 rounded-lg">
                  <h4 className="font-bold text-green-900 text-xs mb-2 uppercase tracking-wider flex items-center gap-2">
                    <Sparkles className="w-3 h-3" /> Recommendation
                  </h4>
                  <p className="text-green-900 text-sm leading-relaxed">{advice.suggestion}</p>
                </div>

                <p className="text-center italic text-[#786f66] text-sm mt-4 px-8">
                  "{advice.encouragement}"
                </p>

                <Button 
                  variant="outline" 
                  onClick={resetModal} 
                  className="w-full border-[#8b5a3c]/20 text-[#8b5a3c] hover:bg-[#8b5a3c]/5 mt-2"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Ask Another Question
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}