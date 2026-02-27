export interface Product {
  id?: number | string;
  _id?: string;
  name: string;
  price: number;
  description: string;
  category: string;
  countInStock: number;
  sku?: string;
  mainImage: string;
  images: string[];
  brand?: string;
  isFeatured?: boolean;
  rating?: number;
  numReviews?: number;
  ingredients?: string;
  benefits?: string;
  size?: string;
  howToUse?: string;
  reviews?: ProductReview[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductReview {
  _id: string;
  name: string;
  rating: number;
  comment: string;
  user: string;
  createdAt: string;
}

export interface ProductFormData {
  name: string;
  price: string;
  category: string;
  description: string;
  countInStock: string;
  sku: string;
  mainImage: string;
  images: string[];
  isFeatured: boolean;
  brand: string;
  rating: string;
  ingredients: string;
  benefits: string;
  size: string;
  howToUse: string;
}

export interface ProductApiData {
  name: string;
  price: number;
  category: string;
  description: string;
  countInStock: number;
  mainImage: string;
  images: string[];
  sku?: string;
  brand?: string;
  isFeatured?: boolean;
  rating?: number;
  ingredients?: string;
  benefits?: string;
  size?: string;
  howToUse?: string;
} 