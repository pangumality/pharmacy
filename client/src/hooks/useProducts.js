import { useState, useEffect, useCallback, useRef } from 'react';
import { productApi } from '@/lib/api';
import { toast } from '@/components/ui/sonner';

export const useProducts = (initialParams = {}) => {
  const [products, setProducts] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    totalProducts: 0,
  });
  
  // Use refs to track the previous params and prevent infinite loops
  const initialParamsRef = useRef(initialParams);
  const isInitialFetchRef = useRef(true);

  // Fetch products with filtering
  const fetchProducts = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await productApi.getProducts(params);
      
      setProducts(data.products);
      setPagination({
        page: data.page,
        pages: data.pages,
        totalProducts: data.totalProducts,
      });
      
      return data;
    } catch (error) {
      setError(error.message);
      toast.error(error.message || 'Failed to fetch products');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch featured products
  const fetchFeaturedProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await productApi.getFeaturedProducts();
      setFeaturedProducts(data);
      
      return data;
    } catch (error) {
      setError(error.message);
      toast.error(error.message || 'Failed to fetch featured products');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch a single product by ID
  const fetchProductById = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await productApi.getProductById(id);
      return data;
    } catch (error) {
      setError(error.message);
      toast.error(error.message || 'Failed to fetch product');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Load initial products on component mount only
  useEffect(() => {
    // Only fetch on initial mount
    if (isInitialFetchRef.current) {
      isInitialFetchRef.current = false;
      fetchProducts(initialParams);
    }
  }, [fetchProducts]);

  return {
    products,
    featuredProducts,
    loading,
    error,
    pagination,
    fetchProducts,
    fetchFeaturedProducts,
    fetchProductById,
  };
}; 