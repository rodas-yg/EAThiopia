import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Utensils, Mail, Lock, User, Coffee } from "lucide-react";
import { EthiopianPattern } from "./EthiopianPattern";
import { GoogleLogin } from '@react-oauth/google'; // Import Google Login

interface AuthPageProps {
  onAuth: (email: string) => void;
}

export function AuthPage({ onAuth }: AuthPageProps) {
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");

  // --- GOOGLE AUTH HANDLER ---
  const handleGoogleSuccess = async (credentialResponse: any) => {
    const token = credentialResponse.credential;

    try {
      // Connect to your Flask Backend
      const response = await fetch('http://127.0.0.1:5000/api/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: token }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log("✅ Google Login Success:", data);
        
        // Save user session
        localStorage.setItem('user_id', data.user_id);
        localStorage.setItem('username', data.username);
        
        // Trigger parent authentication flow
        onAuth(data.email); 
      } else {
        console.error("❌ Backend Login Failed:", data.error);
        alert("Login failed. Please try again.");
      }
    } catch (error) {
      console.error("⚠️ Network Error:", error);
      alert("Could not connect to the server. Is Flask running?");
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginEmail && loginPassword) {
      onAuth(loginEmail);
    }
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (signupName && signupEmail && signupPassword) {
      onAuth(signupEmail);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#8b5a3c] via-[#a67c52] to-[#c89968] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <EthiopianPattern className="w-full h-full text-white" />
        </div>
        
        <div className="relative z-10 flex flex-col items-center justify-center w-full p-12 text-white">
          <div className="max-w-md text-center space-y-6">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center mx-auto shadow-2xl">
              <Utensils className="w-10 h-10" />
            </div>
            
            <h1 className="text-5xl font-bold">EAThiopia</h1>
            <p className="text-xl font-light">የእርስዎ የጤና ጉዞ</p>
            
            <div className="pt-8 space-y-4">
              <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm p-4 rounded-xl">
                <Coffee className="w-6 h-6 flex-shrink-0" />
                <p className="text-sm text-left">
                  Track traditional Ethiopian dishes with authentic calorie data
                </p>
              </div>
              
              <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm p-4 rounded-xl">
                <Utensils className="w-6 h-6 flex-shrink-0" />
                <p className="text-sm text-left">
                  Get personalized meal suggestions from injera to kitfo
                </p>
              </div>
              
              <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm p-4 rounded-xl">
                <User className="w-6 h-6 flex-shrink-0" />
                <p className="text-sm text-left">
                  Achieve your health goals with Ethiopian cuisine
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Auth Forms */}
      <div className="flex-1 flex items-center justify-center p-8 bg-[#faf8f5] relative">
        <div className="absolute inset-0 opacity-20">
          <EthiopianPattern className="w-full h-full text-[#8b5a3c]" />
        </div>

        <Card className="w-full max-w-md shadow-2xl border-[#8b5a3c]/20 relative z-10 bg-white/95 backdrop-blur">
          <CardContent className="p-8">
            {/* Mobile Logo */}
            <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
              <div className="w-12 h-12 bg-gradient-to-br from-[#8b5a3c] to-[#c89968] rounded-2xl flex items-center justify-center">
                <Utensils className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[#2d2520]">EAThiopia</h1>
                <p className="text-xs text-[#786f66]">የእርስዎ የጤና ጉዞ</p>
              </div>
            </div>

            {/* --- GOOGLE LOGIN SECTION START --- */}
            <div className="mb-6 flex flex-col items-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => console.log('Login Failed')}
                theme="outline"
                size="large"
                width="100%"
                text="continue_with"
                shape="rectangular"
              />
            </div>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-[#8b5a3c]/20" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-[#786f66]">Or continue with email</span>
              </div>
            </div>
            {/* --- GOOGLE LOGIN SECTION END --- */}

            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8 bg-[#e8e1d8]">
                <TabsTrigger 
                  value="login"
                  className="data-[state=active]:bg-[#8b5a3c] data-[state=active]:text-white"
                >
                  Sign In
                </TabsTrigger>
                <TabsTrigger 
                  value="signup"
                  className="data-[state=active]:bg-[#8b5a3c] data-[state=active]:text-white"
                >
                  Sign Up
                </TabsTrigger>
              </TabsList>

              {/* Login Form */}
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <h2 className="text-2xl font-semibold text-[#2d2520] mb-2">
                      Welcome Back
                    </h2>
                    <p className="text-sm text-[#786f66]">
                      Sign in to continue your journey
                    </p>
                  </div>

                  <div className="space-y-4 pt-4">
                    <div>
                      <Label htmlFor="login-email">Email</Label>
                      <div className="relative mt-1.5">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#786f66]" />
                        <Input
                          id="login-email"
                          type="email"
                          placeholder="you@example.com"
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          className="pl-11 border-[#8b5a3c]/20 focus:border-[#8b5a3c] bg-[#f5f1ec]"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="login-password">Password</Label>
                      <div className="relative mt-1.5">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#786f66]" />
                        <Input
                          id="login-password"
                          type="password"
                          placeholder="••••••••"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          className="pl-11 border-[#8b5a3c]/20 focus:border-[#8b5a3c] bg-[#f5f1ec]"
                          required
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-[#8b5a3c] hover:bg-[#6b4423] text-white shadow-lg h-11"
                    >
                      Sign In
                    </Button>
                  </div>
                </form>
              </TabsContent>

              {/* Signup Form */}
              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div>
                    <h2 className="text-2xl font-semibold text-[#2d2520] mb-2">
                      Create Account
                    </h2>
                    <p className="text-sm text-[#786f66]">
                      Start your health journey today
                    </p>
                  </div>

                  <div className="space-y-4 pt-4">
                    <div>
                      <Label htmlFor="signup-name">Full Name</Label>
                      <div className="relative mt-1.5">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#786f66]" />
                        <Input
                          id="signup-name"
                          placeholder="Your name"
                          value={signupName}
                          onChange={(e) => setSignupName(e.target.value)}
                          className="pl-11 border-[#8b5a3c]/20 focus:border-[#8b5a3c] bg-[#f5f1ec]"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="signup-email">Email</Label>
                      <div className="relative mt-1.5">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#786f66]" />
                        <Input
                          id="signup-email"
                          type="email"
                          placeholder="you@example.com"
                          value={signupEmail}
                          onChange={(e) => setSignupEmail(e.target.value)}
                          className="pl-11 border-[#8b5a3c]/20 focus:border-[#8b5a3c] bg-[#f5f1ec]"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="signup-password">Password</Label>
                      <div className="relative mt-1.5">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#786f66]" />
                        <Input
                          id="signup-password"
                          type="password"
                          placeholder="••••••••"
                          value={signupPassword}
                          onChange={(e) => setSignupPassword(e.target.value)}
                          className="pl-11 border-[#8b5a3c]/20 focus:border-[#8b5a3c] bg-[#f5f1ec]"
                          required
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-[#8b5a3c] hover:bg-[#6b4423] text-white shadow-lg h-11"
                    >
                      Create Account
                    </Button>
                  </div>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}