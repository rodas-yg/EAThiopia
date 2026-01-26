import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "./ui/select";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

// --- UPDATED API URL LOGIC ---
const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000";

export interface OnboardingData {
  name: string;
  calorieTarget: number;
}

export function Onboarding({ onComplete }: { onComplete: (data: OnboardingData) => void }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    weight: "",
    height: "",
    age: "",
    gender: "male",
    activity_level: "moderate",
    goal: "maintain"
  });

  const handleSubmit = async () => {
    setLoading(true);
    const userId = localStorage.getItem('user_id');
    
    if (!userId) {
        toast.error("User ID not found. Please log in again.");
        setLoading(false);
        return;
    }

    try {
      const res = await fetch(`${API_URL}/api/user/${userId}/stats`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (res.ok) {
        const responseData = await res.json();
        onComplete({
            name: localStorage.getItem('username') || "User",
            calorieTarget: responseData.calorie_goal
        });
      } else {
        toast.error("Failed to save data.");
      }
    } catch (e) {
      toast.error("Network Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-lg shadow-lg">
        <CardHeader>
          <CardTitle>Let's personalize EAThiopia</CardTitle>
          <CardDescription>Step {step} of 2: {step === 1 ? "Basic Info" : "Goals"}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {step === 1 ? (
             <div className="space-y-3">
                <Label>Weight (kg)</Label>
                <Input type="number" value={data.weight} onChange={(e) => setData({...data, weight: e.target.value})} />
                
                <Label>Height (cm)</Label>
                <Input type="number" value={data.height} onChange={(e) => setData({...data, height: e.target.value})} />

                <Label>Age</Label>
                <Input type="number" value={data.age} onChange={(e) => setData({...data, age: e.target.value})} />

                <Button className="w-full bg-[#8b5a3c]" onClick={() => setStep(2)}>Next</Button>
             </div>
          ) : (
             <div className="space-y-3">
                <Label>Gender</Label>
                <Select onValueChange={(v) => setData({...data, gender: v})} defaultValue={data.gender}>
                    <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                    </SelectContent>
                </Select>

                <Label>Activity Level</Label>
                <Select onValueChange={(v) => setData({...data, activity_level: v})} defaultValue={data.activity_level}>
                    <SelectTrigger><SelectValue placeholder="Select activity" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="sedentary">Sedentary (Office Job)</SelectItem>
                        <SelectItem value="light">Lightly Active</SelectItem>
                        <SelectItem value="moderate">Moderately Active</SelectItem>
                        <SelectItem value="active">Very Active</SelectItem>
                    </SelectContent>
                </Select>

                <div className="flex gap-2 pt-4">
                    <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                    <Button className="flex-1 bg-[#8b5a3c]" onClick={handleSubmit} disabled={loading}>
                        {loading ? <Loader2 className="animate-spin" /> : "Finish Setup"}
                    </Button>
                </div>
             </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}