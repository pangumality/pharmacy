import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/sonner";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, isAdmin } = useAuth();
  
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect user if already logged in - DISABLED to allow re-login if session is stale
  /*
  useEffect(() => {
    // Only redirect if we are sure the user is authenticated and loading is complete
    // Adding a small delay or check might help if state is bouncing
    if (isAuthenticated) {
      console.log("User is authenticated, redirecting...");
      navigate(isAdmin ? "/admin" : "/");
    }
  }, [isAuthenticated, isAdmin, navigate]);
  */

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Call the login method from AuthContext
      const userData = await login(loginData.email, loginData.password);
      
      // Navigate based on user role
      const role = (userData?.role || userData?.user?.role || "").toString().toLowerCase();
      const isAdminUser = userData?.isAdmin === true || userData?.user?.isAdmin === true || role === "admin";

      if (isAdminUser) {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } catch (error) {
      // Error is already handled by the AuthContext
      console.error("Login error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center">
      <div className="container-custom py-16">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <img 
              src="/logo.png" 
              alt="hello260 Logo" 
              className="h-20 w-auto mx-auto mb-4 object-contain"
            />
            <h1 className="heading-lg">Welcome Back</h1>
            <p className="text-gray-600">
              Login to access your account and manage your orders
            </p>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-sm">
                <form onSubmit={handleLoginSubmit} className="space-y-6">
                  <div>
                    <Label htmlFor="login-email" className="mb-2 block">Email</Label>
                    <Input
                      id="login-email"
                      name="email"
                      type="email"
                      value={loginData.email}
                      onChange={handleLoginChange}
                      placeholder="Your Email"
                      required
                    />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <Label htmlFor="login-password">Password</Label>
                      <a href="#" className="text-sm text-hello260-green hover:underline">
                        Forgot Password?
                      </a>
                    </div>
                    <Input
                      id="login-password"
                      name="password"
                      type="password"
                      value={loginData.password}
                      onChange={handleLoginChange}
                      placeholder="Your Password"
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-hello260-green hover:bg-hello260-green/90 text-white"
                    disabled={isSubmitting}
                  >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Logging in...
                  </>
                ) : (
                  "Login"
                )}
                  </Button>
                </form>
            
            <div className="mt-8 pt-6 border-t text-center text-sm text-gray-600">
              <p>
                By logging in, you agree to our{" "}
                <a href="#" className="text-hello260-green hover:underline">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="#" className="text-hello260-green hover:underline">
                  Privacy Policy
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
