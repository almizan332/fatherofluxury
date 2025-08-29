import React from 'react';
import { useAuth } from '@/auth/AuthProvider';
import { useProfile } from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';
import { LogOut, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Header: React.FC = () => {
  const { signOut, user } = useAuth();
  const { profile } = useProfile();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <header className="bg-background border-b border-border px-4 py-3 flex justify-between items-center">
      <div className="flex items-center gap-2">
        <User className="h-5 w-5" />
        <span className="text-sm text-muted-foreground">
          {profile?.email || user.email}
          {profile?.role === 'admin' && (
            <span className="ml-2 text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
              Admin
            </span>
          )}
        </span>
      </div>
      
      <Button
        variant="outline"
        size="sm"
        onClick={handleSignOut}
        className="flex items-center gap-2"
      >
        <LogOut className="h-4 w-4" />
        Sign Out
      </Button>
    </header>
  );
};