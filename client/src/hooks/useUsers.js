import { useState, useCallback } from 'react';
import { userApi } from '@/lib/api';
import { toast } from '@/components/ui/sonner';
import { useAuth } from '@/contexts/AuthContext';

export const useUsers = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { isAuthenticated, isAdmin } = useAuth();

  // Get all users (admin only)
  const getAllUsers = useCallback(async () => {
    if (!isAuthenticated || !isAdmin) {
      toast.error('Not authorized to access user list');
      return null;
    }

    try {
      setLoading(true);
      setError(null);
      
      const data = await userApi.getAllUsers();
      setUsers(data);
      return data;
    } catch (error) {
      setError(error.message);
      toast.error(error.message || 'Failed to fetch users');
      return null;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, isAdmin]);

  // Get user by ID (admin only)
  const getUserById = useCallback(async (id) => {
    if (!isAuthenticated || !isAdmin) {
      toast.error('Not authorized to access user details');
      return null;
    }

    try {
      setLoading(true);
      setError(null);
      
      const data = await userApi.getUserById(id);
      setSelectedUser(data);
      return data;
    } catch (error) {
      setError(error.message);
      toast.error(error.message || 'Failed to fetch user details');
      return null;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, isAdmin]);

  // Update user (admin only)
  const updateUser = useCallback(async (id, userData) => {
    if (!isAuthenticated || !isAdmin) {
      toast.error('Not authorized to update users');
      return null;
    }

    try {
      setLoading(true);
      setError(null);
      
      const data = await userApi.updateUser(id, userData);
      
      // Update the user in the users array
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user._id === id ? { ...user, ...data } : user
        )
      );
      
      toast.success('User updated successfully');
      return data;
    } catch (error) {
      setError(error.message);
      toast.error(error.message || 'Failed to update user');
      return null;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, isAdmin]);

  // Delete user (admin only)
  const deleteUser = useCallback(async (id) => {
    if (!isAuthenticated || !isAdmin) {
      toast.error('Not authorized to delete users');
      return null;
    }

    try {
      setLoading(true);
      setError(null);
      
      await userApi.deleteUser(id);
      
      // Remove the user from the users array
      setUsers(prevUsers => prevUsers.filter(user => user._id !== id));
      
      toast.success('User deleted successfully');
      return true;
    } catch (error) {
      setError(error.message);
      toast.error(error.message || 'Failed to delete user');
      return null;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, isAdmin]);

  // Get user statistics (admin only)
  const getUserStats = useCallback(async () => {
    if (!isAuthenticated || !isAdmin) {
      toast.error('Not authorized to access user statistics');
      return null;
    }

    try {
      setLoading(true);
      setError(null);
      
      const data = await userApi.getUserStats();
      return data;
    } catch (error) {
      setError(error.message);
      toast.error(error.message || 'Failed to fetch user statistics');
      return null;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, isAdmin]);

  return {
    users,
    selectedUser,
    loading,
    error,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
    getUserStats
  };
}; 