import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Settings } from "lucide-react";

interface TargetSetterProps {
  currentTarget: number;
  onUpdateTarget: (target: number) => void;
}

export function TargetSetter({ currentTarget, onUpdateTarget }: TargetSetterProps) {
  const [open, setOpen] = useState(false);
  const [target, setTarget] = useState(currentTarget.toString());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newTarget = Number(target);
    if (newTarget > 0) {
      onUpdateTarget(newTarget);
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="border-[#8b5a3c]/30 hover:bg-[#8b5a3c]/5">
          <Settings className="w-4 h-4 mr-2" />
          Set Daily Target
        </Button>
      </DialogTrigger>
      <DialogContent className="border-[#8b5a3c]/20">
        <DialogHeader>
          <DialogTitle className="text-[#2d2520]">Set Your Daily Calorie Target</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="target">Daily Calorie Target</Label>
            <Input
              id="target"
              type="number"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder="e.g., 2000"
              className="border-[#8b5a3c]/20 focus:border-[#8b5a3c] bg-[#f5f1ec]"
              required
            />
            <p className="text-sm text-[#786f66] mt-2">
              Recommended ranges: 1,800-2,200 for women, 2,200-2,800 for men (varies by activity level)
            </p>
          </div>
          <Button type="submit" className="w-full bg-[#8b5a3c] hover:bg-[#6b4423]">
            Update Target
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}