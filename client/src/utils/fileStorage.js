// File Storage utility for handling image uploads
import { toast } from "@/components/ui/use-toast";

const API_URL = import.meta.env.VITE_API_URL || '/api';

// Helper function to get auth header with token
const getAuthHeader = () => {
  const userInfo = localStorage.getItem('userInfo');
  const token = userInfo ? JSON.parse(userInfo).token : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * Upload an image file to the server
 * @param {File} file - The file object to upload
 * @returns {Promise<string>} The URL of the uploaded image
 */
export const uploadImage = async (file) => {
  try {
    if (!file) {
      throw new Error('No file provided');
    }

    // Create FormData to send the file
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(`${API_URL}/upload`, {
      method: 'POST',
      headers: {
        ...getAuthHeader(),
        // Don't set Content-Type as it's automatically set with the boundary for FormData
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to upload image');
    }

    const data = await response.json();
    return data.imageUrl; // Return the URL of the uploaded image
  } catch (error) {
    console.error('Image upload error:', error);
    toast({
      title: "Error",
      description: error.message || 'Failed to upload image',
      variant: "destructive",
    });
    throw error;
  }
};

/**
 * Delete an image from the server
 * @param {string} imageUrl - The URL of the image to delete
 * @returns {Promise<boolean>} Whether the deletion was successful
 */
export const deleteImage = async (imageUrl) => {
  try {
    if (!imageUrl) {
      return true; // No image to delete
    }

    // Extract the image filename from the URL
    const filename = imageUrl.split('/').pop();
    
    const response = await fetch(`${API_URL}/upload/${filename}`, {
      method: 'DELETE',
      headers: {
        ...getAuthHeader(),
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to delete image');
    }

    return true;
  } catch (error) {
    console.error('Image deletion error:', error);
    toast({
      title: "Error",
      description: error.message || 'Failed to delete image',
      variant: "destructive",
    });
    return false;
  }
};

/**
 * Extracts filename from an image URL
 * @param {string} imageUrl - The full image URL
 * @returns {string} The filename extracted from the URL
 */
export const getFilenameFromUrl = (imageUrl) => {
  if (!imageUrl) return '';
  return imageUrl.split('/').pop();
}; 