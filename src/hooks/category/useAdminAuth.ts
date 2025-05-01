
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
      const isAdminUser = session?.user?.email === 'homeincome08@gmail.com' || isLoggedIn;
      
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
      const isAdminUser = session?.user?.email === 'homeincome08@gmail.com' || isLoggedIn;
      
      setIsAdmin(isAdminUser);
      
      if (!isAdminUser && window.location.pathname.includes('/dashboard')) {
        navigate('/almizan');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  return { isAdmin };
}
