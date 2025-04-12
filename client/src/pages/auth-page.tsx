import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useTheme } from "@/components/theme-provider";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { AlertCircle, CheckCircle2, Moon, Sun } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
  remember: z.boolean().optional(),
});

const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<string>("login");
  const [showVerification, setShowVerification] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState("");
  const [location, navigate] = useLocation();
  const { theme, setTheme } = useTheme();
  
  let auth;
  try {
    auth = useAuth();
  } catch (error) {
    // If useAuth fails, we'll use direct mutations
    auth = {
      user: null,
      isLoading: false,
      error: null
    };
  }
  
  // Get URL parameters
  const params = new URLSearchParams(window.location.search);
  const verified = params.get('verified') === 'true';

  // Fallback mutations if useAuth fails
  const loginMutationFallback = useMutation({
    mutationFn: async (credentials: { username: string; password: string }) => {
      const res = await apiRequest("POST", "/api/login", credentials);
      return await res.json();
    },
    onSuccess: () => {
      navigate("/");
    }
  });

  const registerMutationFallback = useMutation({
    mutationFn: async (credentials: RegisterFormValues) => {
      const res = await apiRequest("POST", "/api/register", credentials);
      return await res.json();
    },
    onSuccess: () => {
      setShowVerification(true);
    }
  });

  const resendVerificationMutationFallback = useMutation({
    mutationFn: async (data: { email: string }) => {
      const res = await apiRequest("POST", "/api/resend-verification", data);
      return await res.json();
    }
  });

  // Use the auth context mutations if available, otherwise use fallbacks
  const loginMutation = auth.loginMutation || loginMutationFallback;
  const registerMutation = auth.registerMutation || registerMutationFallback;
  const resendVerificationMutation = auth.resendVerificationMutation || resendVerificationMutationFallback;

  useEffect(() => {
    if (auth.user) {
      navigate("/");
    }
  }, [auth.user, navigate]);

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
      remember: false,
    },
  });

  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onLoginSubmit = (data: LoginFormValues) => {
    loginMutation.mutate({
      username: data.username,
      password: data.password,
    });
  };

  const onRegisterSubmit = (data: RegisterFormValues) => {
    registerMutation.mutate({
      username: data.username,
      email: data.email,
      password: data.password,
    }, {
      onSuccess: () => {
        setVerificationEmail(data.email);
        setShowVerification(true);
      }
    });
  };

  const handleResendVerification = () => {
    if (verificationEmail) {
      resendVerificationMutation.mutate({ email: verificationEmail });
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row">
      {/* Form Section */}
      <div className="flex-1 flex items-center justify-center p-4 bg-background">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10 text-primary"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 8a7 7 0 1 0 14 0a7 7 0 1 0 -14 0" />
                <path d="M19 12v7a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2v-7" />
                <path d="M13 12l-3 -3l-3 3" />
                <path d="M7 6l10 0" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-primary">MinecraftBot</h1>
            <p className="text-muted-foreground">Bot Management Panel</p>
          </div>
          
          {verified && (
            <Alert className="mb-6 bg-secondary/10 border-secondary">
              <CheckCircle2 className="h-4 w-4 text-secondary" />
              <AlertTitle className="text-secondary">Verification Successful</AlertTitle>
              <AlertDescription>
                Your email has been verified. You can now log in.
              </AlertDescription>
            </Alert>
          )}

          <Card>
            <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full">
                <TabsTrigger value="login" className="flex-1">Login</TabsTrigger>
                <TabsTrigger value="register" className="flex-1">Register</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <CardContent className="pt-6">
                  <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                      <FormField
                        control={loginForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input placeholder="your_username" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="••••••••" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="flex items-center space-x-2">
                        <FormField
                          control={loginForm.control}
                          name="remember"
                          render={({ field }) => (
                            <FormItem className="flex items-center space-x-2">
                              <FormControl>
                                <Checkbox 
                                  checked={field.value} 
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <FormLabel className="text-sm font-normal">Remember me</FormLabel>
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
                        {loginMutation.isPending ? "Signing in..." : "Sign In"}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </TabsContent>
              
              <TabsContent value="register">
                <CardContent className="pt-6">
                  <Form {...registerForm}>
                    <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                      <FormField
                        control={registerForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input placeholder="your_username" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={registerForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="you@example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={registerForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="••••••••" {...field} />
                            </FormControl>
                            <FormMessage />
                            <p className="text-xs text-muted-foreground mt-1">
                              Password must be at least 8 characters long
                            </p>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={registerForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirm Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="••••••••" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Button type="submit" className="w-full" disabled={registerMutation.isPending}>
                        {registerMutation.isPending ? "Registering..." : "Register"}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </TabsContent>
            </Tabs>
          </Card>
          
          {showVerification && (
            <Alert className="mt-6 bg-accent/10 border-accent">
              <AlertCircle className="h-4 w-4 text-accent" />
              <AlertTitle className="text-accent">Verification Required</AlertTitle>
              <AlertDescription>
                <p className="mb-2">Please check your email to verify your account before you can access the panel.</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2 text-accent hover:text-accent hover:bg-accent/20"
                  onClick={handleResendVerification}
                  disabled={resendVerificationMutation.isPending}
                >
                  {resendVerificationMutation.isPending ? "Sending..." : "Resend verification email"}
                </Button>
              </AlertDescription>
            </Alert>
          )}
          
          <div className="mt-6 flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} MinecraftBot
            </p>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Hero Section - Hidden on mobile */}
      <div className="hidden md:flex flex-1 bg-primary items-center justify-center p-8">
        <div className="max-w-md text-primary-foreground">
          <h1 className="text-4xl font-bold mb-4">Minecraft Bot Management</h1>
          <p className="text-xl mb-6">Control your Minecraft bots from anywhere with our easy-to-use web panel.</p>
          
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="bg-white/10 p-2 rounded-full mr-4">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-6 w-6"
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-lg">Secure Access</h3>
                <p>Verified email registration and secure login keeps your bots protected.</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="bg-white/10 p-2 rounded-full mr-4">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-6 w-6"
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                  <line x1="8" y1="21" x2="16" y2="21" />
                  <line x1="12" y1="17" x2="12" y2="21" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-lg">Remote Control</h3>
                <p>Start, stop, and monitor your bots from any device with internet access.</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="bg-white/10 p-2 rounded-full mr-4">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-6 w-6"
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
                  <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-lg">Easy Setup</h3>
                <p>No Minecraft premium account required. Connect to any server in seconds.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
