import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

export const useAdminCheck = () => {
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdminRole = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          navigate('/auth');
          return;
        }

        // Check if user has admin role using the has_role function
        const { data, error } = await supabase.rpc('has_role', {
          _user_id: user.id,
          _role: 'admin'
        });

        if (error) {
          console.error('Error checking admin role:', error);
          setIsAdmin(false);
          navigate('/');
          return;
        }

        setIsAdmin(data === true);
        
        if (data !== true) {
          navigate('/');
        }
      } catch (error) {
        console.error('Error in admin check:', error);
        setIsAdmin(false);
        navigate('/');
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminRole();
  }, [navigate]);

  return { isAdmin, isLoading };
};
