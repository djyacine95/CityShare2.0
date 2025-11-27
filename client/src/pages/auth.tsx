import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const { user, refetchUser } = useAuth(); // We need refetchUser to update state after login
  const { toast } = useToast();
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // If already logged in, go home
  if (user) {
    setLocation("/");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = isLogin ? "/api/login" : "/api/register";
      await apiRequest("POST", url, { username, password });
      
      // Update the app state to know we are logged in
      await refetchUser(); 
      setLocation("/");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Authentication failed",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <CardTitle className="text-2xl text-center font-bold">
            {isLogin ? "Welcome Back" : "Create Account"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Username</label>
              <Input 
                type="text" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
                required 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <Input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
              />
            </div>
            <Button type="submit" className="w-full">
              {isLogin ? "Log In" : "Sign Up"}
            </Button>
            <div className="text-center mt-4">
              <Button 
                type="button" 
                variant="link" 
                onClick={() => setIsLogin(!isLogin)}
              >
                {isLogin ? "Need an account? Sign up" : "Already have an account? Log in"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}