import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Utensils, Target, TrendingUp, ChevronRight, ChevronLeft, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { TibebPattern } from "./TibebPattern";

interface OnboardingProps {
  onComplete: (data: OnboardingData) => void;
}

export interface OnboardingData {
  name: string;
  age: number;
  gender: string;
  weight: number; 
  height: number; 
  activityLevel: string;
  goal: string;
  targetWeight?: number;
  calorieTarget: number;
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Partial<OnboardingData>>({
    activityLevel: "moderate",
    goal: "maintain",
    gender: "male"
  });

  const calculateCalories = () => {
    // Simple BMR calculation (Mifflin-St Jeor)
    const weight = data.weight || 70;
    const height = data.height || 170;
    const age = data.age || 30;
    const gender = data.gender || "male";
    
    // Mifflin-St Jeor Equation
    let bmr = (10 * weight) + (6.25 * height) - (5 * age);
    bmr += gender === "male" ? 5 : -161;
    
    // Adjust for activity level
    const activityMultiplier = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      veryActive: 1.9,
    }[data.activityLevel || "moderate"] || 1.55;
    
    let calories = Math.round(bmr * activityMultiplier);
    
    // Adjust for goal
    if (data.goal === "lose") calories -= 500;
    if (data.goal === "gain") calories += 300;
    
    return calories;
  };

  const handleNext = async () => {
    if (step === 2) {
      // --- FINAL STEP: SAVE TO BACKEND ---
      setLoading(true);
      const calorieTarget = calculateCalories();
      const userId = localStorage.getItem('user_id');

      if (!userId) {
        console.error("No User ID found!");
        setLoading(false);
        return;
      }

      try {

        await fetch(`http://127.0.0.1:5000/api/user/${userId}/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: data.name })
        });


        const response = await fetch(`http://127.0.0.1:5000/api/user/${userId}/stats`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            weight: data.weight,
            height: data.height,
            age: data.age,
            activity_level: data.activityLevel,
            target: data.goal,
            target_weight: data.targetWeight 
          })
        });

        if (response.ok) {
           console.log("✅ Stats saved successfully!");
           onComplete({ ...data, calorieTarget } as OnboardingData);
        } else {
           console.error("Failed to save stats");
           alert("Something went wrong saving your profile. Please try again.");
        }

      } catch (error) {
        console.error("Network Error:", error);
        alert("Could not connect to server.");
      } finally {
        setLoading(false);
      }

    } else {
      setStep(step + 1);
    }
  };

  const canProceed = () => {
    if (step === 0) return data.name && data.age && data.gender && data.weight && data.height;
    if (step === 1) return data.activityLevel;
    if (step === 2) return data.goal;
    return true;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#faf8f5] via-[#f5f1ec] to-[#e8d5c4] relative overflow-hidden">
      {/* Background Pattern */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        transition={{ duration: 1 }}
        className="absolute inset-0"
      >
        <TibebPattern className="w-full h-full text-[#8b5a3c]" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl mx-4 relative z-10"
      >
        <Card className="shadow-2xl border-[#8b5a3c]/20 bg-white/95 backdrop-blur overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1">
            <TibebPattern className="w-full h-full text-[#8b5a3c]" variant="border" />
          </div>
          <CardContent className="p-8 md:p-12">
            {/* Logo & Progress */}
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mb-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <motion.div
                  initial={{ rotate: -180, scale: 0 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, delay: 0.3 }}
                  className="w-14 h-14 bg-gradient-to-br from-[#8b5a3c] to-[#c89968] rounded-2xl flex items-center justify-center shadow-lg"
                >
                  <Utensils className="w-7 h-7 text-white" />
                </motion.div>
                <div>
                  <h1 className="text-3xl font-bold text-[#2d2520]">EAThiopia</h1>
                  <p className="text-sm text-[#786f66]">የእርስዎ የጤና ጉዞ</p>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="flex gap-2">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.3, delay: 0.4 + i * 0.1 }}
                    className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                      i <= step ? "bg-[#8b5a3c]" : "bg-[#e8e1d8]"
                    }`}
                    style={{ transformOrigin: "left" }}
                  />
                ))}
              </div>
            </motion.div>

            <AnimatePresence mode="wait">
              {/* Step 0: Personal Info & Biometrics */}
              {step === 0 && (
                <motion.div
                  key="step0"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="text-2xl font-semibold text-[#2d2520] mb-2">
                      Tell us about yourself
                    </h2>
                    <p className="text-[#786f66]">
                      We need this to calculate your personalized health plan
                    </p>
                  </div>

                  <div className="space-y-4">
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        placeholder="Your name"
                        value={data.name || ""}
                        onChange={(e) => setData({ ...data, name: e.target.value })}
                        className="mt-1.5 border-[#8b5a3c]/20 focus:border-[#8b5a3c] bg-[#f5f1ec]"
                      />
                    </motion.div>

                    <div className="grid grid-cols-2 gap-4">
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        <Label htmlFor="age">Age</Label>
                        <Input
                          id="age"
                          type="number"
                          placeholder="25"
                          value={data.age || ""}
                          onChange={(e) => setData({ ...data, age: Number(e.target.value) })}
                          className="mt-1.5 border-[#8b5a3c]/20 focus:border-[#8b5a3c] bg-[#f5f1ec]"
                        />
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        <Label>Gender</Label>
                        <RadioGroup
                          value={data.gender}
                          onValueChange={(value) => setData({ ...data, gender: value })}
                          className="flex gap-4 mt-3"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="male" id="male" />
                            <Label htmlFor="male" className="font-normal cursor-pointer">Male</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="female" id="female" />
                            <Label htmlFor="female" className="font-normal cursor-pointer">Female</Label>
                          </div>
                        </RadioGroup>
                      </motion.div>
                    </div>

                    {/* NEW FIELDS: HEIGHT & WEIGHT */}
                    <div className="grid grid-cols-2 gap-4">
                       <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                      >
                        <Label htmlFor="weight">Weight (kg)</Label>
                        <Input
                          id="weight"
                          type="number"
                          placeholder="70"
                          value={data.weight || ""}
                          onChange={(e) => setData({ ...data, weight: Number(e.target.value) })}
                          className="mt-1.5 border-[#8b5a3c]/20 focus:border-[#8b5a3c] bg-[#f5f1ec]"
                        />
                      </motion.div>
                      
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                      >
                        <Label htmlFor="height">Height (cm)</Label>
                        <Input
                          id="height"
                          type="number"
                          placeholder="175"
                          value={data.height || ""}
                          onChange={(e) => setData({ ...data, height: Number(e.target.value) })}
                          className="mt-1.5 border-[#8b5a3c]/20 focus:border-[#8b5a3c] bg-[#f5f1ec]"
                        />
                      </motion.div>
                    </div>

                  </div>
                </motion.div>
              )}

              {/* Step 1: Activity Level */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="text-2xl font-semibold text-[#2d2520] mb-2">
                      Your Activity Level
                    </h2>
                    <p className="text-[#786f66]">
                      This helps us calculate your daily calorie needs
                    </p>
                  </div>

                  <RadioGroup
                    value={data.activityLevel}
                    onValueChange={(value) => setData({ ...data, activityLevel: value })}
                    className="space-y-3"
                  >
                    {[
                      { value: "sedentary", label: "Sedentary", desc: "Little or no exercise" },
                      { value: "light", label: "Lightly Active", desc: "Exercise 1-3 days/week" },
                      { value: "moderate", label: "Moderately Active", desc: "Exercise 3-5 days/week" },
                      { value: "active", label: "Very Active", desc: "Exercise 6-7 days/week" },
                      { value: "veryActive", label: "Extremely Active", desc: "Physical job or training twice/day" },
                    ].map((option, index) => (
                      <motion.label
                        key={option.value}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.02 }}
                        className={`flex items-start p-4 border-2 rounded-xl cursor-pointer transition-all hover:border-[#8b5a3c]/50 ${
                          data.activityLevel === option.value
                            ? "border-[#8b5a3c] bg-[#8b5a3c]/5"
                            : "border-[#e8e1d8]"
                        }`}
                      >
                        <RadioGroupItem value={option.value} id={option.value} className="mt-1" />
                        <div className="ml-3 flex-1">
                          <div className="font-medium text-[#2d2520]">{option.label}</div>
                          <div className="text-sm text-[#786f66]">{option.desc}</div>
                        </div>
                      </motion.label>
                    ))}
                  </RadioGroup>
                </motion.div>
              )}

              {/* Step 2: Goals */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="text-2xl font-semibold text-[#2d2520] mb-2">
                      What's Your Goal?
                    </h2>
                    <p className="text-[#786f66]">
                      We'll adjust your calorie target accordingly
                    </p>
                  </div>

                  <div className="grid gap-4">
                    {[
                      { value: "lose", label: "Lose Weight", icon: TrendingUp, color: "#b8654d" },
                      { value: "maintain", label: "Maintain Weight", icon: Target, color: "#8b5a3c" },
                      { value: "gain", label: "Gain Weight", icon: TrendingUp, color: "#c89968" },
                    ].map((goal, index) => (
                      <motion.button
                        key={goal.value}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setData({ ...data, goal: goal.value })}
                        className={`flex items-center p-6 border-2 rounded-xl text-left transition-all hover:border-[#8b5a3c]/50 ${
                          data.goal === goal.value
                            ? "border-[#8b5a3c] bg-[#8b5a3c]/5"
                            : "border-[#e8e1d8]"
                        }`}
                      >
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center mr-4"
                          style={{ backgroundColor: `${goal.color}15` }}
                        >
                          <goal.icon className="w-6 h-6" style={{ color: goal.color }} />
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-[#2d2520]">{goal.label}</div>
                        </div>
                      </motion.button>
                    ))}
                  </div>

                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="p-6 bg-[#8b5a3c]/5 border border-[#8b5a3c]/20 rounded-xl"
                  >
                    <p className="text-sm text-[#786f66] mb-2">Your estimated daily calorie target:</p>
                    <p className="text-3xl font-bold text-[#8b5a3c]">
                      {calculateCalories().toLocaleString()} cal
                    </p>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex gap-3 mt-8"
            >
              {step > 0 && (
                <Button
                  variant="outline"
                  onClick={() => setStep(step - 1)}
                  disabled={loading}
                  className="border-[#8b5a3c]/20 hover:bg-[#8b5a3c]/5"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              )}
              <Button
                onClick={handleNext}
                disabled={!canProceed() || loading}
                className="flex-1 bg-[#8b5a3c] hover:bg-[#6b4423] text-white shadow-lg"
              >
                {loading ? (
                    <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                    </>
                ) : (
                    <>
                        {step === 2 ? "Get Started" : "Continue"}
                        {step !== 2 && <ChevronRight className="w-4 h-4 ml-2" />}
                    </>
                )}
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}