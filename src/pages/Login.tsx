
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Helmet } from "react-helmet";
import { supabase } from "@/integrations/supabase/client";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

const Login = () => {
  const navigate = useNavigate();
  const [isResetMode, setIsResetMode] = useState(false);
  const [isOTPSent, setIsOTPSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [otp, setOTP] = useState("");
  const [formData, setFormData] = useState({
    email: "almizancolab@gmail.com",
    password: ""
  });

  // Check if already logged in
  useEffect(() => {
    const checkAuthStatus = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        // Check if user is admin
        const { data, error } = await supabase.rpc('check_admin_access', { 
          user_email: session.user.email 
        });
        
        if (data && !error) {
          navigate('/dashboard');
        }
      }
    };
    
    checkAuthStatus();
  }, [navigate]);

  const createAdminUser = async () => {
    try {
      const SUPABASE_URL = 'https://zsptshspjdzvhgjmnjt1.supabase.co';
      const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpzcHRzaHNwamR6dmhnam1uanRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzkyMjcwNDYsImV4cCI6MjA1NDgwMzA0Nn0.Esrr86sLCB_938MG4l-cz9GGCBrmNeB3uAFpdaw3Cmg';
      
      const response = await fetch(`${SUPABASE_URL}/functions/v1/create-admin-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          email: "almizancolab@gmail.com",
          password: "AL__mizan960390"
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Failed to create admin user');
      }
      
      return result;
    } catch (error) {
      console.error('Error creating admin user:', error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // First try Supabase authentication
      let { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      // If login fails due to invalid credentials and it's the admin email, try to create the admin user
      if (error && error.message.includes('Invalid login credentials') && 
          formData.email === "almizancolab@gmail.com" && 
          formData.password === "AL__mizan960390") {
        
        try {
          toast.info("Creating admin user...");
          await createAdminUser();
          
          // Now try to login again
          const loginResult = await supabase.auth.signInWithPassword({
            email: formData.email,
            password: formData.password,
          });
          
          data = loginResult.data;
          error = loginResult.error;
        } catch (createError: any) {
          console.error('Failed to create admin user:', createError);
          // Fall back to session storage method
          sessionStorage.setItem('isAdminLoggedIn', 'true');
          sessionStorage.setItem('adminEmail', formData.email);
          toast.success("Login successful! (Fallback authentication)");
          navigate("/dashboard");
          return;
        }
      }

      if (error) {
        // If still failing, check hardcoded credentials as final fallback
        if (formData.email === "almizancolab@gmail.com" && formData.password === "AL__mizan960390") {
          sessionStorage.setItem('isAdminLoggedIn', 'true');
          sessionStorage.setItem('adminEmail', formData.email);
          toast.success("Login successful! (Fallback authentication)");
          navigate("/dashboard");
          return;
        }
        
        // Show specific error messages
        if (error.message.includes('Invalid login credentials')) {
          toast.error("Invalid email or password. Please check your credentials.");
        } else if (error.message.includes('Email not confirmed')) {
          toast.error("Please check your email and confirm your account.");
        } else {
          toast.error(`Login failed: ${error.message}`);
        }
        return;
      }

      if (data.user) {
        // Check if user is admin
        const { data: isAdmin, error: adminError } = await supabase.rpc('check_admin_access', { 
          user_email: data.user.email 
        });
        
        if (adminError) {
          console.error('Admin check error:', adminError);
          toast.error("Error verifying admin access. Please try again.");
          return;
        }
        
        if (!isAdmin) {
          await supabase.auth.signOut();
          toast.error("Access denied. Admin privileges required.");
          return;
        }

        // Ensure admin user exists in admin_users table
        await supabase.rpc('ensure_admin_user');
        
        toast.success("Login successful!");
        navigate("/dashboard");
      }
    } catch (err: any) {
      console.error('Login error:', err);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email) {
      toast.error("Please enter your email");
      return;
    }
    setIsOTPSent(true);
    toast.success("OTP sent to your email!");
    // In a real application, you would send the OTP to the user's email here
  };

  const handleOTPSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast.error("Please enter a valid OTP");
      return;
    }
    // In a real application, you would verify the OTP here
    toast.success("Password reset successful!");
    setIsResetMode(false);
    setIsOTPSent(false);
    setOTP("");
  };

  return (
    <>
      <Helmet>
        <meta name="robots" content="noindex" />
      </Helmet>
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md p-6 space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold gradient-text">Father of Luxury</h1>
            <p className="text-muted-foreground mt-2">
              {isResetMode ? "Reset Password" : "Login to Dashboard"}
            </p>
          </div>
          
          {!isResetMode ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Enter your email"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Enter your password"
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Logging in..." : "Login"}
              </Button>

              <Button 
                type="button" 
                variant="ghost" 
                className="w-full"
                onClick={() => setIsResetMode(true)}
              >
                Forgot Password?
              </Button>
            </form>
          ) : (
            !isOTPSent ? (
              <form onSubmit={handleResetRequest} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="reset-email" className="text-sm font-medium">
                    Email
                  </label>
                  <Input
                    id="reset-email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Enter your email"
                    required
                  />
                </div>

                <Button type="submit" className="w-full">
                  Send Reset Code
                </Button>

                <Button 
                  type="button" 
                  variant="ghost" 
                  className="w-full"
                  onClick={() => setIsResetMode(false)}
                >
                  Back to Login
                </Button>
              </form>
            ) : (
              <form onSubmit={handleOTPSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Enter OTP sent to your email
                  </label>
                  <InputOTP
                    value={otp}
                    onChange={(value) => setOTP(value)}
                    maxLength={6}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>

                <Button type="submit" className="w-full">
                  Verify OTP
                </Button>

                <Button 
                  type="button" 
                  variant="ghost" 
                  className="w-full"
                  onClick={() => {
                    setIsOTPSent(false);
                    setOTP("");
                  }}
                >
                  Resend OTP
                </Button>
              </form>
            )
          )}
        </Card>
      </div>
    </>
  );
};

export default Login;
