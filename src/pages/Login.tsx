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
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  
  // 2FA states
  const [show2FA, setShow2FA] = useState(false);
  const [is2FALoading, setIs2FALoading] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [preferredMethod, setPreferredMethod] = useState<'email' | 'sms'>('email');
  const [phoneNumber, setPhoneNumber] = useState("");
  const [carrier, setCarrier] = useState("");

  // Check if already logged in
  useEffect(() => {
    const checkAuthStatus = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data } = await supabase.rpc('is_admin');
        if (data) {
          navigate('/dashboard');
        }
      }
    };
    
    checkAuthStatus();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Authenticate with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          toast.error("Invalid email or password. Please check your credentials.");
        } else if (error.message.includes('Email not confirmed')) {
          toast.error("Please check your email and confirm your account.");
        } else {
          toast.error(`Login failed: ${error.message}`);
        }
        return;
      }

      if (data?.user) {
        // Check if user is admin
        const { data: isAdminData } = await supabase.rpc('is_admin');
        
        if (!isAdminData) {
          await supabase.auth.signOut();
          toast.error("Access denied. Admin privileges required.");
          return;
        }

        // Credentials are valid, initiate 2FA
        setShow2FA(true);
        await send2FACode();
        toast.success("Please check your " + preferredMethod + " for verification code");
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
          phone: phoneNumber,
          carrier: carrier
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
      toast.success("Login successful!");
      navigate("/dashboard");

    } catch (error: any) {
      console.error('2FA verification error:', error);
      if (error.message.includes('blocked')) {
        toast.error(error.message);
        setShow2FA(false);
      } else {
        toast.error(error.message || 'Invalid verification code');
      }
    } finally {
      setIs2FALoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <meta name="robots" content="noindex" />
      </Helmet>
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md p-6 space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold gradient-text">Aliexpress Hidden Links</h1>
            <p className="text-muted-foreground mt-2">
              {show2FA ? "🔐 Two-Factor Authentication" : "Admin Login"}
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
                <>
                  <div className="space-y-2">
                    <label htmlFor="phone" className="text-sm font-medium">
                      Phone Number (numbers only)
                    </label>
                    <Input
                      id="phone"
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                      placeholder="1234567890"
                      required={preferredMethod === 'sms'}
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="carrier" className="text-sm font-medium">
                      Carrier
                    </label>
                    <select
                      id="carrier"
                      value={carrier}
                      onChange={(e) => setCarrier(e.target.value)}
                      className="w-full p-2 border rounded"
                      required={preferredMethod === 'sms'}
                    >
                      <option value="">Select Carrier</option>
                      <option value="att">AT&T</option>
                      <option value="verizon">Verizon</option>
                      <option value="tmobile">T-Mobile</option>
                      <option value="sprint">Sprint</option>
                      <option value="boost">Boost Mobile</option>
                      <option value="cricket">Cricket</option>
                      <option value="uscellular">US Cellular</option>
                      <option value="metro">Metro PCS</option>
                    </select>
                  </div>
                </>
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
                  disabled={is2FALoading || (preferredMethod === 'sms' && (!phoneNumber || !carrier))}
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
          ) : (
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
            </form>
          )}
        </Card>
      </div>
    </>
  );
};

export default Login;
