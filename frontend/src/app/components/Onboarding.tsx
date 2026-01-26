import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Utensils, Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { TibebPattern } from "./TibebPattern";

export interface OnboardingData {
  name: string;
  age: number;
  gender: string;
  height: number;
  weight: number;
  goalWeight: number; 
  activityLevel: string;
  calorieTarget: number;
}

interface OnboardingProps {
  onComplete: (data: OnboardingData) => void;
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<OnboardingData>>({
    gender: "male",
    activityLevel: "moderate"
  });

  const updateForm = (key: keyof OnboardingData, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const calculateCalories = () => {
    if (!formData.weight || !formData.height || !formData.age || !formData.goalWeight) return 2000;
    
    // BMR Calculation (Mifflin-St Jeor)
    let bmr = (10 * formData.weight) + (6.25 * formData.height) - (5 * formData.age);
    bmr += formData.gender === "male" ? 5 : -161;
    
    // Activity Multiplier
    const multipliers: {[key: string]: number} = {
        sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725
    };
    const tdee = bmr * (multipliers[formData.activityLevel || "moderate"] || 1.2);

    // Goal Adjustment
    let target = tdee;
    if (formData.goalWeight < formData.weight) target -= 500; // Lose weight
    else if (formData.goalWeight > formData.weight) target += 500; // Gain weight

    return Math.round(target);
  };

  const handleFinish = async () => {
    setLoading(true);
    const userId = localStorage.getItem('user_id');
    const finalCalories = calculateCalories();
    
    const finalData = { ...formData, calorieTarget: finalCalories } as OnboardingData;

    try {
        const res = await fetch(`http://127.0.0.1:5000/api/user/${userId}/stats`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                age: finalData.age,
                gender: finalData.gender,
                height: finalData.height,
                weight: finalData.weight,
                goal_weight: finalData.goalWeight,
                target_weight: finalData.goalWeight,
                activity_level: finalData.activityLevel,
                calorie_target: finalData.calorieTarget
            })
        });

        if (res.ok) {
            toast.success("Profile saved!");
            onComplete(finalData);
        } else {
            toast.error("Failed to save profile.");
        }
    } catch (e) {
        toast.error("Connection error.");
    }
    setLoading(false);
  };

  const handleLogout = () => {
      localStorage.clear();
      window.location.reload();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f1ec] relative overflow-hidden p-4">
      {/* BACKGROUND */}
      <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
        <TibebPattern className="w-full h-full text-[#8b5a3c]" variant="default" />
      </div>

      <Card className="w-full max-w-lg border-[#8b5a3c]/20 shadow-xl bg-white/95 backdrop-blur z-10">
        <CardHeader className="text-center relative">
            <Button variant="ghost" className="absolute left-4 top-4 text-gray-400 hover:text-[#8b5a3c]" onClick={handleLogout} title="Back to Login">
                <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="mx-auto w-12 h-12 bg-[#8b5a3c] rounded-xl flex items-center justify-center mb-4 shadow-md">
                <Utensils className="w-6 h-6 text-white" />
            </div>
            <CardTitle className="text-2xl text-[#2d2520]">Let's Get Started</CardTitle>
            <CardDescription>Step {step} of 3: {step === 1 ? "Basic Info" : step === 2 ? "Body Stats" : "Activity"}</CardDescription>
        </CardHeader>
        <CardContent>
            {/* STEP 1: BASICS */}
            {step === 1 && (
                <div className="space-y-4 animate-in slide-in-from-right duration-300">
                    <div className="space-y-2"><Label>First Name</Label><Input onChange={(e) => updateForm('name', e.target.value)} value={formData.name || ''} /></div>
                    <div className="space-y-2"><Label>Age</Label><Input type="number" onChange={(e) => updateForm('age', parseInt(e.target.value))} value={formData.age || ''} /></div>
                    <div className="space-y-2"><Label>Gender</Label>
                        <Select onValueChange={(v) => updateForm('gender', v)} defaultValue={formData.gender}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent><SelectItem value="male">Male</SelectItem><SelectItem value="female">Female</SelectItem></SelectContent>
                        </Select>
                    </div>
                    <Button className="w-full bg-[#8b5a3c]" onClick={() => setStep(2)}>Next</Button>
                </div>
            )}
            
            {/* STEP 2: BODY STATS */}
            {step === 2 && (
                <div className="space-y-4 animate-in slide-in-from-right duration-300">
                    <div className="space-y-2"><Label>Height (cm)</Label><Input type="number" onChange={(e) => updateForm('height', parseFloat(e.target.value))} value={formData.height || ''} /></div>
                    <div className="space-y-2"><Label>Current Weight (kg)</Label><Input type="number" onChange={(e) => updateForm('weight', parseFloat(e.target.value))} value={formData.weight || ''} /></div>
                    <div className="space-y-2"><Label>Goal Weight (kg)</Label><Input type="number" onChange={(e) => updateForm('goalWeight', parseFloat(e.target.value))} value={formData.goalWeight || ''} /></div>
                    <div className="flex gap-2">
                        <Button variant="outline" className="w-1/2" onClick={() => setStep(1)}>Back</Button>
                        <Button className="w-1/2 bg-[#8b5a3c]" onClick={() => setStep(3)}>Next</Button>
                    </div>
                </div>
            )}

            {/* STEP 3: ACTIVITY & FINISH */}
            {step === 3 && (
                <div className="space-y-4 animate-in slide-in-from-right duration-300">
                    <div className="space-y-2"><Label>Activity Level</Label>
                        <Select onValueChange={(v) => updateForm('activityLevel', v)} defaultValue={formData.activityLevel}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="sedentary">Sedentary (Office Job)</SelectItem>
                                <SelectItem value="light">Lightly Active (1-3 days/week)</SelectItem>
                                <SelectItem value="moderate">Moderately Active (3-5 days/week)</SelectItem>
                                <SelectItem value="active">Very Active (6-7 days/week)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex gap-2">
                         <Button variant="outline" className="w-1/2" onClick={() => setStep(2)}>Back</Button>
                         <Button className="w-1/2 bg-[#8b5a3c]" onClick={handleFinish} disabled={loading}>
                            {loading ? <Loader2 className="animate-spin" /> : "Finish"}
                         </Button>
                    </div>
                </div>
            )}
        </CardContent>
      </Card>
    </div>
  );
}