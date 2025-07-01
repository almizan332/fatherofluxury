
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export function useAdminAuth() {
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdminStatus = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      // Check if logged in via session or via custom credentials
      const isLoggedIn = Boolean(session?.user) || sessionStorage.getItem('isAdminLoggedIn') === 'true';
      const isAdminUser = session?.user?.email === 'almizancolab@gmail.com' || 
                         sessionStorage.getItem('adminEmail') === 'almizancolab@gmail.com' || 
                         isLoggedIn;
      
      setIsAdmin(isAdminUser);

      if (!isAdminUser && window.location.pathname.includes('/dashboard')) {
        navigate('/almizan');
      }
    };

    checkAdminStatus();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
      
      // Check if logged in via session or via custom credentials
      const isLoggedIn = Boolean(session?.user) || sessionStorage.getItem('isAdminLoggedIn') === 'true';
      const isAdminUser = session?.user?.email === 'almizancolab@gmail.com' || 
                         sessionStorage.getItem('adminEmail') === 'almizancolab@gmail.com' || 
                         isLoggedIn;
      
      setIsAdmin(isAdminUser);
      
      if (!isAdminUser && window.location.pathname.includes('/dashboard')) {
        navigate('/almizan');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const logout = async () => {
    try {
      // Clear session storage
      sessionStorage.removeItem('isAdminLoggedIn');
      sessionStorage.removeItem('adminEmail');
      
      // Sign out from Supabase
      await supabase.auth.signOut();
      
      // Navigate to login
      navigate('/almizan');
    } catch (error) {
      console.error('Logout error:', error);
      // Even if Supabase logout fails, clear local state
      sessionStorage.removeItem('isAdminLoggedIn');
      sessionStorage.removeItem('adminEmail');
      navigate('/almizan');
    }
  };

  return { isAdmin, logout };
}
