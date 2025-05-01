
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Helmet } from "react-helmet";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

const Login = () => {
  const navigate = useNavigate();
  const [isResetMode, setIsResetMode] = useState(false);
  const [isOTPSent, setIsOTPSent] = useState(false);
  const [otp, setOTP] = useState("");
  const [formData, setFormData] = useState({
    email: "homeincome08@gmail.com",
    password: ""
  });

  // Check if already logged in
  useEffect(() => {
    if (sessionStorage.getItem('isAdminLoggedIn') === 'true') {
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Default credentials check
    if (formData.email === "homeincome08@gmail.com" && formData.password === "AL__mizan960390") {
      // Store login state in session storage
      sessionStorage.setItem('isAdminLoggedIn', 'true');
      toast.success("Login successful!");
      navigate("/dashboard");
    } else {
      toast.error("Invalid credentials!");
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

              <Button type="submit" className="w-full">
                Login
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
