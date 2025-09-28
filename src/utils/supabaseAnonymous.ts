import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

// Single anonymous client instance for public data access
let anonClient: ReturnType<typeof createClient<Database>> | null = null;

export const getAnonymousClient = () => {
  if (!anonClient) {
    anonClient = createClient<Database>(
      'https://zsptshspjdzvhgjmnjtl.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpzcHRzaHNwamR6dmhnam1uanRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzkyMjcwNDYsImV4cCI6MjA1NDgwMzA0Nn0.Esrr86sLCB_938MG4l-cz9GGCBrmNeB3uAFpdaw3Cmg',
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false
        }
      }
    );
  }
  return anonClient;
};