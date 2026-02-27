import { useState, useCallback, useEffect } from 'react';
import { orderApi } from '@/lib/api';
import { toast } from '@/components/ui/sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export const useOrders = () => {
  const [orders, setOrders] = useState([]);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const navigate = useNavigate();

  // Verify authentication status on mount and when auth changes
  useEffect(() => {
    if (!isAuthenticated) {
      setOrders([]);
      setOrder(null);
    }
  }, [isAuthenticated]);

  // Handle authentication errors
  const handleAuthError = useCallback((error) => {
    if (error.message.includes('Authentication failed') || 
        error.message.includes('Authentication required') ||
        error.message.includes('token failed') ||
        error.message.includes('no token')) {
      toast.error('Your session has expired. Please log in again.');
      logout();
      navigate('/login?redirect=checkout');
      return true;
    }
    return false;
  }, [logout, navigate]);

  // Create a new order
  const createOrder = useCallback(async (orderData) => {
    if (!isAuthenticated) {
      toast.error('You must be logged in to place an order');
      navigate('/login?redirect=checkout');
      return null;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Verify we have a valid token before making the request
      if (!user?.token) {
        toast.error('Authentication token is missing. Please log in again.');
        logout();
        navigate('/login?redirect=checkout');
        return null;
      }
      
      const data = await orderApi.createOrder(orderData);
      toast.success('Order placed successfully');
      return data;
    } catch (error) {
      setError(error.message || 'Failed to place order');
      
      // Check if this is an authentication error
      if (!handleAuthError(error)) {
        toast.error(error.message || 'Failed to place order');
      }
      
      return null;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user, navigate, handleAuthError, logout]);

  // Get order details by ID
  const getOrderById = useCallback(async (id) => {
    if (!isAuthenticated) {
      toast.error('You must be logged in to view order details');
      navigate('/login');
      return null;
    }

    try {
      setLoading(true);
      setError(null);
      
      const data = await orderApi.getOrderById(id);
      setOrder(data);
      return data;
    } catch (error) {
      setError(error.message || 'Failed to fetch order');
      handleAuthError(error) || toast.error(error.message || 'Failed to fetch order');
      return null;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, handleAuthError, navigate]);

  // Mark order as paid
  const updateOrderToPaid = useCallback(async (id, paymentResult) => {
    if (!isAuthenticated) {
      toast.error('You must be logged in to update payment');
      navigate('/login');
      return null;
    }

    try {
      setLoading(true);
      setError(null);
      
      const data = await orderApi.updateOrderToPaid(id, paymentResult);
      setOrder(data);
      toast.success('Payment processed successfully');
      return data;
    } catch (error) {
      setError(error.message || 'Failed to process payment');
      handleAuthError(error) || toast.error(error.message || 'Failed to process payment');
      return null;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, handleAuthError, navigate]);

  // Get current user's orders
  const getUserOrders = useCallback(async () => {
    if (!isAuthenticated) {
      toast.error('You must be logged in to view your orders');
      navigate('/login');
      return [];
    }

    try {
      setLoading(true);
      setError(null);
      
      const data = await orderApi.getUserOrders();
      setOrders(data);
      return data;
    } catch (error) {
      setError(error.message || 'Failed to fetch your orders');
      handleAuthError(error) || toast.error(error.message || 'Failed to fetch your orders');
      return [];
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, handleAuthError, navigate]);

  // Admin: Get all orders
  const getAllOrders = useCallback(async () => {
    if (!isAuthenticated || !isAdmin) {
      toast.error('You must be logged in as admin to view all orders');
      navigate('/login');
      return [];
    }

    try {
      setLoading(true);
      setError(null);
      
      const data = await orderApi.getAllOrders();
      setOrders(data);
      return data;
    } catch (error) {
      setError(error.message || 'Failed to fetch orders');
      handleAuthError(error) || toast.error(error.message || 'Failed to fetch orders');
      return [];
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, isAdmin, handleAuthError, navigate]);

  // Admin: Mark order as delivered
  const updateOrderToDelivered = useCallback(async (id) => {
    if (!isAuthenticated || !isAdmin) {
      toast.error('You must be logged in as admin to update delivery status');
      navigate('/login');
      return null;
    }

    try {
      setLoading(true);
      setError(null);
      
      const data = await orderApi.updateOrderToDelivered(id);
      setOrder(data);
      setOrders((prev) =>
        (prev || []).map((o) => ((o?._id || o?.id) === (data?._id || data?.id) ? data : o))
      );
      toast.success('Order marked as delivered');
      return data;
    } catch (error) {
      setError(error.message || 'Failed to update delivery status');
      handleAuthError(error) || toast.error(error.message || 'Failed to update delivery status');
      return null;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, isAdmin, handleAuthError, navigate]);

  // Admin: Update order status
  const updateOrderStatus = useCallback(async (id, status) => {
    if (!isAuthenticated || !isAdmin) {
      toast.error('You must be logged in as admin to update order status');
      navigate('/login');
      return null;
    }

    try {
      setLoading(true);
      setError(null);
      
      const data = await orderApi.updateOrderStatus(id, status);
      setOrder(data);
      setOrders((prev) =>
        (prev || []).map((o) => ((o?._id || o?.id) === (data?._id || data?.id) ? data : o))
      );
      toast.success(`Order status updated to ${status}`);
      return data;
    } catch (error) {
      setError(error.message || 'Failed to update order status');
      handleAuthError(error) || toast.error(error.message || 'Failed to update order status');
      return null;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, isAdmin, handleAuthError, navigate]);

  return {
    orders,
    order,
    loading,
    error,
    createOrder,
    getOrderById,
    updateOrderToPaid,
    getUserOrders,
    getAllOrders,
    updateOrderToDelivered,
    updateOrderStatus,
  };
}; 
