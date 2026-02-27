import React, { createContext, useState, useContext, useEffect } from 'react';
import { toast } from "@/components/ui/sonner";
import { authApi } from '@/lib/api';

// Create context
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in from localStorage
  useEffect(() => {
    const loadUserFromStorage = () => {
      try {
        const userInfoFromStorage = localStorage.getItem('userInfo');
        if (userInfoFromStorage) {
          const parsedUser = JSON.parse(userInfoFromStorage);
          
          // Check if user has a token
          if (!parsedUser.token) {
            console.warn('No token found in stored user data');
            localStorage.removeItem('userInfo');
            return;
          }
          
          // Set the user in state
          setUser(parsedUser);
        }
      } catch (error) {
        console.error('Error loading user from localStorage:', error);
        localStorage.removeItem('userInfo');
      } finally {
        setLoading(false);
      }
    };
    
    loadUserFromStorage();
  }, []);

  // Login handler
  const login = async (email, password) => {
    try {
      setLoading(true);
      const data = await authApi.login(email, password);
      
      // Validate received data has the required fields
      if (!data || !data.token) {
        throw new Error('Invalid response from server. Missing token.');
      }
      
      setUser(data);
      localStorage.setItem('userInfo', JSON.stringify(data));
      toast.success('Login successful');
      return data;
    } catch (error) {
      toast.error(error.message || 'Invalid email or password');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Register handler
  const register = async (userData) => {
    try {
      setLoading(true);
      const data = await authApi.register(userData);
      
      // Validate received data has the required fields
      if (!data || !data.token) {
        throw new Error('Invalid response from server. Missing token.');
      }
      
      setUser(data);
      localStorage.setItem('userInfo', JSON.stringify(data));
      toast.success('Registration successful');
      return data;
    } catch (error) {
      toast.error(error.message || 'Failed to register');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem('userInfo');
    setUser(null);
    toast.info('Logged out successfully');
  };

  // Update profile handler
  const updateProfile = async (userData) => {
    try {
      setLoading(true);
      const data = await authApi.updateUserProfile(userData);
      
      // Make sure we preserve the token in the updated user data
      const updatedUserData = {
        ...data,
        token: user?.token || data.token
      };
      
      setUser(updatedUserData);
      localStorage.setItem('userInfo', JSON.stringify(updatedUserData));
      toast.success('Profile updated successfully');
      return data;
    } catch (error) {
      toast.error(error.message || 'Failed to update profile');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateProfile,
        isAuthenticated: !!user?.token,
        isAdmin:
          user?.isAdmin === true ||
          user?.user?.isAdmin === true ||
          (typeof (user?.role || user?.user?.role) === "string" &&
            (user?.role || user?.user?.role).toLowerCase() === "admin"),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 
