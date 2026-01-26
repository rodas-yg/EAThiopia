import { GoogleLogin } from '@react-oauth/google';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Utensils, Loader2 } from "lucide-react";
import { useState } from "react";
import { jwtDecode } from "jwt-decode";
import { toast } from "sonner";
import { TibebPattern } from "./TibebPattern"; 

const API_URL = "";

export function AuthPage({ onAuth }: { onAuth: () => void }) {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ username: "", password: "", email: "" });

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: credentialResponse.credential })
      });

      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      
      localStorage.setItem('user_id', data.user_id);
      localStorage.setItem('username', data.username);
      if (data.picture) localStorage.setItem('user_picture', data.picture);
      
      toast.success(`Welcome, ${data.username}!`);
      onAuth();
    } catch (error) {
      console.error("Auth Error:", error);
      toast.error("Google Login Failed. Check Console.");
    } finally {
      setLoading(false);
    }
  };

  const handleManualAuth = async () => {
    setLoading(true);
    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    try {
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('user_id', data.user_id);
        localStorage.setItem('username', data.username);
        onAuth();
      } else {
        toast.error(data.error);
      }
    } catch (e) {
      toast.error("Server Connection Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-[#faf8f5] p-4">
      <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
        <TibebPattern className="w-full h-full text-[#8b5a3c]" variant="default" />
      </div>

      <Card className="w-full max-w-md z-10 shadow-xl border-[#8b5a3c]/20 bg-white/95 backdrop-blur">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-[#8b5a3c] rounded-xl flex items-center justify-center mb-2">
            <Utensils className="text-white w-6 h-6" />
          </div>
          <CardTitle className="text-2xl font-bold">EAThiopia</CardTitle>
          <CardDescription>{isLogin ? "Sign in to your account" : "Create your account"}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-center w-full overflow-hidden">
             <GoogleLogin 
                onSuccess={handleGoogleSuccess} 
                onError={() => toast.error("Google Error")}
                useOneTap
                theme="filled_blue"
                shape="pill"
             />
          </div>

          <div className="relative text-center text-xs uppercase text-gray-400">
            <hr className="border-gray-200" />
            <span className="relative -top-2 bg-white px-2">Or use credentials</span>
          </div>

          <div className="space-y-2">
            <Label>Username</Label>
            <Input value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} />
            
            {!isLogin && (
              <>
                <Label>Email</Label>
                <Input value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
              </>
            )}

            <Label>Password</Label>
            <Input type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
          </div>

          <Button className="w-full bg-[#8b5a3c] hover:bg-[#6b4423]" onClick={handleManualAuth} disabled={loading}>
            {loading ? <Loader2 className="animate-spin" /> : (isLogin ? "Sign In" : "Register")}
          </Button>

          <button onClick={() => setIsLogin(!isLogin)} className="w-full text-sm text-[#8b5a3c] hover:underline">
            {isLogin ? "Need an account? Sign up" : "Have an account? Sign in"}
          </button>
        </CardContent>
      </Card>
    </div>
  );
}