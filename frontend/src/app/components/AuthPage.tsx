import { GoogleLogin } from '@react-oauth/google';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Utensils, Loader2 } from "lucide-react";
import { useState } from "react";
import { jwtDecode } from "jwt-decode";
import { toast } from "sonner";

interface AuthPageProps {
  onAuth: () => void;
}

export function AuthPage({ onAuth }: AuthPageProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ username: "", password: "", email: "" });

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setLoading(true);
    try {
      // 1. Decode locally to get the picture immediately
      if (credentialResponse.credential) {
        const decoded: any = jwtDecode(credentialResponse.credential);
        if (decoded.picture) {
            localStorage.setItem('user_picture', decoded.picture);
        }
      }

      // 2. Send token to backend
      const res = await fetch('http://127.0.0.1:5000/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: credentialResponse.credential })
      });

      const data = await res.json();
      
      if (res.ok) {
        localStorage.setItem('user_id', data.user_id);
        localStorage.setItem('username', data.username);
        // Ensure backend picture is saved if available
        if (data.picture) localStorage.setItem('user_picture', data.picture);
        
        toast.success(`Welcome back, ${data.username}!`);
        onAuth();
      } else {
        toast.error(data.error || "Login failed");
      }
    } catch (error) {
      toast.error("Connection error");
    } finally {
      setLoading(false);
    }
  };

  const handleManualAuth = async () => {
    setLoading(true);
    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    
    try {
      const res = await fetch(`http://127.0.0.1:5000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      
      if (res.ok) {
        localStorage.setItem('user_id', data.user_id);
        localStorage.setItem('username', data.username);
        // Clear picture for manual users (unless you add avatar upload later)
        localStorage.removeItem('user_picture');
        
        toast.success(isLogin ? "Login successful!" : "Account created!");
        onAuth();
      } else {
        toast.error(data.error || "Authentication failed");
      }
    } catch (error) {
        toast.error("Server connection failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f1ec] p-4">
      <Card className="w-full max-w-md border-[#8b5a3c]/20 shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-[#8b5a3c] rounded-xl flex items-center justify-center mb-4">
            <Utensils className="w-6 h-6 text-white" />
          </div>
          <CardTitle className="text-2xl text-[#2d2520]">EAThiopia</CardTitle>
          <CardDescription>
            {isLogin ? "Welcome back! Please login." : "Create your account to get started."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex justify-center">
            <GoogleLogin 
                onSuccess={handleGoogleSuccess} 
                onError={() => toast.error("Google Login Failed")}
                theme="outline"
                size="large"
                width="100%"
            />
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-gray-200" /></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-gray-500">Or continue with</span></div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Username</Label>
              <Input 
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})} 
                placeholder="Enter username" 
              />
            </div>
            {!isLogin && (
                <div className="space-y-2">
                <Label>Email</Label>
                <Input 
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})} 
                    placeholder="Enter email" 
                />
                </div>
            )}
            <div className="space-y-2">
              <Label>Password</Label>
              <Input 
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})} 
                placeholder="Enter password" 
              />
            </div>

            <Button className="w-full bg-[#8b5a3c] hover:bg-[#6b4423]" onClick={handleManualAuth} disabled={loading}>
              {loading ? <Loader2 className="animate-spin" /> : (isLogin ? "Sign In" : "Create Account")}
            </Button>

            <div className="text-center text-sm">
                <span className="text-gray-500">{isLogin ? "Don't have an account? " : "Already have an account? "}</span>
                <button onClick={() => setIsLogin(!isLogin)} className="text-[#8b5a3c] hover:underline font-medium">
                    {isLogin ? "Sign up" : "Sign in"}
                </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}