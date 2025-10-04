
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export function useAdminAuth() {
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdminStatus = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        setIsAdmin(false);
        if (window.location.pathname.includes('/dashboard')) {
          navigate('/almizan');
        }
        return;
      }

      // Check admin status from database using RLS
      const { data, error } = await supabase.rpc('is_admin');
      
      if (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
        if (window.location.pathname.includes('/dashboard')) {
          navigate('/almizan');
        }
        return;
      }

      setIsAdmin(data === true);

      if (!data && window.location.pathname.includes('/dashboard')) {
        navigate('/almizan');
      }
    };

    checkAdminStatus();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event);
      
      if (!session?.user) {
        setIsAdmin(false);
        if (window.location.pathname.includes('/dashboard')) {
          navigate('/almizan');
        }
        return;
      }

      // Check admin status from database using RLS
      const { data, error } = await supabase.rpc('is_admin');
      
      if (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
        return;
      }

      setIsAdmin(data === true);
      
      if (!data && window.location.pathname.includes('/dashboard')) {
        navigate('/almizan');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/almizan');
    } catch (error) {
      console.error('Logout error:', error);
      navigate('/almizan');
    }
  };

  return { isAdmin, logout };
}
