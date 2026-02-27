import { toast } from "@/components/ui/sonner";

const API_URL = import.meta.env.VITE_API_URL || '/api';

// Helper function to get auth header with token
const getAuthHeader = () => {
  try {
    const userInfo = localStorage.getItem('userInfo');
    if (!userInfo) return {};
    
    const parsed = JSON.parse(userInfo);
    const token = parsed?.token;
    
    if (!token) {
      console.warn('No token found in userInfo');
      return {};
    }
    
    return { Authorization: `Bearer ${token}` };
  } catch (error) {
    console.error('Error retrieving auth token:', error);
    return {};
  }
};

// Generic fetch function with improved error handling
const fetchApi = async (endpoint, options = {}) => {
  try {
    const url = `${API_URL}${endpoint}`;
    console.log(`Making request to: ${url} with method ${options.method || 'GET'}`);
    const headers = {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
      ...options.headers,
    };

    // Debug authentication headers for protected routes
    if (endpoint.includes('/orders') || endpoint.includes('/users/profile')) {
      console.log('Auth headers:', JSON.stringify(headers));
    }
    
    const response = await fetch(url, {
      ...options,
      headers,
    });

    // First check if the response is JSON
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      // Not a JSON response, handle gracefully
      const text = await response.text();
      const errorMessage = `Server responded with non-JSON content: ${response.status} ${response.statusText}`;
      console.error(errorMessage, text);
      throw new Error(errorMessage);
    }

    // Parse JSON response
    const data = await response.json();

    // Handle non-2xx responses
    if (!response.ok) {
      const errorMessage = data.message || `Error: ${response.status} ${response.statusText}`;
      
      // If authentication error, try to provide more context
      if (response.status === 401) {
        const authHeader = headers.Authorization;
        // Authentication failed - may need to re-login
        if (!authHeader) {
          throw new Error('Authentication required. Please log in.');
        } else {
          throw new Error('Authentication failed. Please log in again.');
        }
      }
      
      throw new Error(errorMessage);
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    
    // Show toast only for specific errors that should be visible to the user
    // This prevents showing multiple similar error messages
    if (!error.message.includes("Server responded with non-JSON content")) {
      toast.error(error.message || 'API request failed');
    }
    
    throw error;
  }
};

// Auth API calls
export const authApi = {
  login: (email, password) => {
    return fetchApi('/users/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  register: (userData) => {
    return fetchApi('/users/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  getUserProfile: () => {
    return fetchApi('/users/profile');
  },

  updateUserProfile: (userData) => {
    return fetchApi('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  },
};

// User API calls for admin
export const userApi = {
  getAllUsers: () => {
    return fetchApi('/users');
  },
  
  getUserById: (id) => {
    return fetchApi(`/users/${id}`);
  },
  
  updateUser: (id, userData) => {
    return fetchApi(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  },
  
  deleteUser: (id) => {
    return fetchApi(`/users/${id}`, {
      method: 'DELETE',
    });
  },
  
  getUserStats: () => {
    return fetchApi('/users/stats');
  }
};

// Product API calls
export const productApi = {
  getProducts: (params = {}) => {
    const queryParams = new URLSearchParams();
    
    // Add any params to the query string
    if (params.keyword) queryParams.append('keyword', params.keyword);
    if (params.category) queryParams.append('category', params.category);
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.minPrice) queryParams.append('minPrice', params.minPrice);
    if (params.maxPrice) queryParams.append('maxPrice', params.maxPrice);
    
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/products?${queryString}` : '/products';
    
    return fetchApi(endpoint);
  },

  getFeaturedProducts: () => {
    return fetchApi('/products/featured');
  },

  getProductById: (id) => {
    return fetchApi(`/products/${id}`);
  },

  // Admin functions
  createProduct: (productData) => {
    return fetchApi('/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  },

  updateProduct: (id, productData) => {
    return fetchApi(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    });
  },

  deleteProduct: (id) => {
    return fetchApi(`/products/${id}`, {
      method: 'DELETE',
    });
  },
};

// Order API calls
export const orderApi = {
  createOrder: (orderData) => {
    return fetchApi('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  },

  getOrderById: (id) => {
    return fetchApi(`/orders/${id}`);
  },

  updateOrderToPaid: (id, paymentResult) => {
    return fetchApi(`/orders/${id}/pay`, {
      method: 'PUT',
      body: JSON.stringify(paymentResult),
    });
  },

  getUserOrders: () => {
    return fetchApi('/orders/myorders');
  },

  // Admin functions
  getAllOrders: () => {
    return fetchApi('/orders');
  },

  updateOrderToDelivered: (id) => {
    return fetchApi(`/orders/${id}/deliver`, {
      method: 'PUT',
    });
  },

  updateOrderStatus: (id, status) => {
    return fetchApi(`/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },

  getOrderStats: () => {
    return fetchApi('/orders/stats/check');
  },
};

// Email API calls
export const emailApi = {
  sendBulkEmail: (data) => {
    return fetchApi('/email/bulk', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

export { getAuthHeader, fetchApi };