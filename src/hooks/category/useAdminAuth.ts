
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export function useAdminAuth() {
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdminStatus = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      const isAdminUser = user?.email === 'homeincome08@gmail.com';
      setIsAdmin(isAdminUser);

      if (!isAdminUser && window.location.pathname.includes('/dashboard')) {
        navigate('/login');
      }
    };

    checkAdminStatus();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
      const isAdminUser = session?.user?.email === 'homeincome08@gmail.com';
      setIsAdmin(isAdminUser);
      
      if (!isAdminUser && window.location.pathname.includes('/dashboard')) {
        navigate('/login');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  return { isAdmin };
}
