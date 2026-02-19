import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const initialized = useRef(false);

  useEffect(() => {
    // Prevent multiple initializations
    if (initialized.current) return;
    initialized.current = true;

    // Check active session
    const getSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          // Get additional user data from users table
          try {
            const { data: userData } = await supabase
              .from('users')
              .select('*')
              .eq('id', session.user.id)
              .single();
            
            setUser({
              id: session.user.id,
              email: session.user.email,
              role: 'admin',
              ...userData
            });
          } catch (userError) {
            // User not in users table, use auth data only
            console.log('User not found in users table, using auth data');
            setUser({
              id: session.user.id,
              email: session.user.email,
              role: 'admin',
              name: session.user.email?.split('@')[0] || 'Admin'
            });
          }
        }
      } catch (error) {
        console.error('Session error:', error);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    // Listen for auth changes - only for sign in/out events
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // Only handle specific events
        if (event === 'SIGNED_IN' && session?.user) {
          try {
            const { data: userData } = await supabase
              .from('users')
              .select('*')
              .eq('id', session.user.id)
              .single();
            
            setUser({
              id: session.user.id,
              email: session.user.email,
              role: 'admin',
              ...userData
            });
          } catch (userError) {
            setUser({
              id: session.user.id,
              email: session.user.email,
              role: 'admin',
              name: session.user.email?.split('@')[0] || 'Admin'
            });
          }
          setLoading(false);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setLoading(false);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (credentials) => {
    const { email, password } = credentials;
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error(error.message);
    }

    if (data.user) {
      // Get additional user data from users table
      try {
        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single();

        const userInfo = {
          id: data.user.id,
          email: data.user.email,
          role: 'admin',
          ...userData
        };

        setUser(userInfo);
        localStorage.setItem('user', JSON.stringify(userInfo));
        
        return userInfo;
      } catch (userError) {
        // User not in users table, use auth data only
        const userInfo = {
          id: data.user.id,
          email: data.user.email,
          role: 'admin',
          name: data.user.email?.split('@')[0] || 'Admin'
        };

        setUser(userInfo);
        localStorage.setItem('user', JSON.stringify(userInfo));
        
        return userInfo;
      }
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('user');
      setUser(null);
    }
  };

  const updateProfile = async (data) => {
    if (!user?.id) return;

    try {
      const { data: updatedUser, error } = await supabase
        .from('users')
        .update(data)
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;

      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return updatedUser;
    } catch (error) {
      console.error('Update profile error:', error);
      throw new Error(error.message);
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      throw new Error(error.message);
    }

    return { message: 'Password changed successfully' };
  };

  const value = {
    user,
    loading,
    login,
    logout,
    updateProfile,
    changePassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;