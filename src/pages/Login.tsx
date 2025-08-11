
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
  
  // 2FA states
  const [show2FA, setShow2FA] = useState(false);
  const [is2FALoading, setIs2FALoading] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [preferredMethod, setPreferredMethod] = useState<'email' | 'sms'>('email');
  const [phoneNumber, setPhoneNumber] = useState("");

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
      // First validate credentials (existing logic)
      let isValidCredentials = false;
      
      // Try Supabase authentication first
      let { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error && error.message.includes('Invalid login credentials') && 
          formData.email === "almizancolab@gmail.com" && 
          formData.password === "AL__mizan960390") {
        
        try {
          toast.info("Creating admin user...");
          await createAdminUser();
          
          const loginResult = await supabase.auth.signInWithPassword({
            email: formData.email,
            password: formData.password,
          });
          
          data = loginResult.data;
          error = loginResult.error;
        } catch (createError: any) {
          console.error('Failed to create admin user:', createError);
          // Use fallback credentials check
          if (formData.email === "almizancolab@gmail.com" && formData.password === "AL__mizan960390") {
            isValidCredentials = true;
          }
        }
      }

      // Check if credentials are valid
      if (data?.user || isValidCredentials || 
          (formData.email === "almizancolab@gmail.com" && formData.password === "AL__mizan960390")) {
        
        if (error && !isValidCredentials && !(formData.email === "almizancolab@gmail.com" && formData.password === "AL__mizan960390")) {
          toast.error(`Login failed: ${error.message}`);
          return;
        }

        // Credentials are valid, now initiate 2FA
        setShow2FA(true);
        await send2FACode();
        toast.success("Please check your " + preferredMethod + " for verification code");
      } else {
        // Invalid credentials
        if (error?.message.includes('Invalid login credentials')) {
          toast.error("Invalid email or password. Please check your credentials.");
        } else if (error?.message.includes('Email not confirmed')) {
          toast.error("Please check your email and confirm your account.");
        } else {
          toast.error(`Login failed: ${error?.message || 'Unknown error'}`);
        }
      }
    } catch (err: any) {
      console.error('Login error:', err);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const send2FACode = async () => {
    setIs2FALoading(true);
    try {
      const { error } = await supabase.functions.invoke('admin-2fa-send', {
        body: { 
          email: formData.email, 
          method: preferredMethod,
          phone: phoneNumber 
        }
      });

      if (error) {
        throw error;
      }
    } catch (error: any) {
      console.error('Error sending 2FA code:', error);
      toast.error(error.message || 'Failed to send verification code');
    } finally {
      setIs2FALoading(false);
    }
  };

  const handle2FASubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIs2FALoading(true);

    try {
      const { data: verifyResult, error } = await supabase.functions.invoke('admin-2fa-verify', {
        body: { 
          email: formData.email, 
          code: verificationCode 
        }
      });

      if (error || !verifyResult?.verified) {
        throw new Error(error?.message || 'Verification failed');
      }

      // 2FA successful, complete login
      sessionStorage.setItem('isAdminLoggedIn', 'true');
      sessionStorage.setItem('adminEmail', formData.email);
      toast.success("Login successful!");
      navigate("/dashboard");

    } catch (error: any) {
      console.error('2FA verification error:', error);
      if (error.message.includes('blocked')) {
        toast.error(error.message);
        setShow2FA(false); // Go back to login form
      } else {
        toast.error(error.message || 'Invalid verification code');
      }
    } finally {
      setIs2FALoading(false);
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
              {show2FA ? "Two-Factor Authentication" : isResetMode ? "Reset Password" : "Login to Dashboard"}
            </p>
          </div>
          
          {show2FA ? (
            <form onSubmit={handle2FASubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Verification Method
                </label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={preferredMethod === 'email' ? 'default' : 'outline'}
                    onClick={() => setPreferredMethod('email')}
                    className="flex-1"
                    disabled={is2FALoading}
                  >
                    Email
                  </Button>
                  <Button
                    type="button"
                    variant={preferredMethod === 'sms' ? 'default' : 'outline'}
                    onClick={() => setPreferredMethod('sms')}
                    className="flex-1"
                    disabled={is2FALoading}
                  >
                    SMS
                  </Button>
                </div>
              </div>

              {preferredMethod === 'sms' && (
                <div className="space-y-2">
                  <label htmlFor="phone" className="text-sm font-medium">
                    Phone Number
                  </label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+1234567890"
                    required={preferredMethod === 'sms'}
                  />
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Enter 6-digit verification code
                </label>
                <InputOTP
                  value={verificationCode}
                  onChange={(value) => setVerificationCode(value)}
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

              <Button type="submit" className="w-full" disabled={is2FALoading || verificationCode.length !== 6}>
                {is2FALoading ? "Verifying..." : "Verify Code"}
              </Button>

              <div className="flex gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={send2FACode}
                  className="flex-1"
                  disabled={is2FALoading || (preferredMethod === 'sms' && !phoneNumber)}
                >
                  {is2FALoading ? "Sending..." : "Resend Code"}
                </Button>
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={() => {
                    setShow2FA(false);
                    setVerificationCode("");
                  }}
                  className="flex-1"
                >
                  Back to Login
                </Button>
              </div>
            </form>
          ) : !isResetMode ? (
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
