import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Minus, Plus, ChevronRight, Star, ShoppingCart, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/sonner";
import { useCart } from "@/contexts/CartContext";
import { formatZMW } from "@/utils/currencyUtils";
import { useProducts } from "@/hooks/useProducts";

type ProductReview = {
  rating: number;
  name: string;
  comment: string;
  createdAt: string;
};

type Product = {
  _id: string;
  name: string;
  price: number;
  image?: string;
  mainImage?: string;
  images?: string[];
  category?: string;
  description?: string;
  rating?: number;
  numReviews?: number;
  countInStock?: number;
  ingredients?: string;
  benefits?: string;
  size?: string;
  howToUse?: string;
  reviews?: ProductReview[];
};

// Remove mock products and use the useProducts hook
const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const { addItem } = useCart();
  
  // Use the products hook
  const { 
    loading, 
    error, 
    fetchProductById,
    products: allProducts,
    fetchProducts
  } = useProducts();

  // Add state for selected image
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    const loadProduct = async () => {
      if (!id) return;
      
      try {
        // Fetch the product by ID
        const productData = (await fetchProductById(id)) as Product | null;
        if (!productData) {
          navigate('/products');
          return;
        }
        
        setProduct(productData);
        setSelectedImage(productData.mainImage || (productData.images && productData.images[0]) || null);
        
        // Fetch related products based on category
        if (productData.category) {
          // Get products in the same category
          const data = await fetchProducts({ category: productData.category });
          if (data?.products) {
            // Filter out the current product and take up to 4 related products
            const related = (data.products as Product[])
              .filter(p => p._id !== id)
              .slice(0, 4);
            setRelatedProducts(related);
          }
        }
      } catch (err) {
        console.error('Error fetching product:', err);
        toast.error('Failed to load product details.');
      }
    };
    
    loadProduct();
    window.scrollTo(0, 0);
  }, [id, fetchProductById, fetchProducts, navigate]);

  const incrementQuantity = () => setQuantity(prev => prev + 1);
  
  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const handleAddToCart = () => {
    if (product) {
      addItem({
        id: product._id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity,
      });
      
      toast.success(`${product.name} added to cart`);
    }
  };

  if (loading) {
    return (
      <div className="container-custom py-12">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-hello260-green" />
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container-custom py-12 text-center">
        <h1 className="heading-lg mb-4">Product Not Found</h1>
        <p className="text-gray-600 mb-6">The product you are looking for does not exist or has been removed.</p>
        <Link to="/products">
          <Button className="bg-hello260-green hover:bg-hello260-green/90 text-white">
            Return to Products
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container-custom py-12">
      {/* Breadcrumbs */}
      <nav className="flex text-sm text-gray-500 mb-8">
        <Link to="/" className="hover:text-hello260-green">Home</Link>
        <ChevronRight size={16} className="mx-2" />
        <Link to="/products" className="hover:text-hello260-green">Products</Link>
        <ChevronRight size={16} className="mx-2" />
        <Link to={`/products?category=${product.category || 'all'}`} className="hover:text-hello260-green capitalize">
          {product.category ? product.category.replace("-", " ") : 'Uncategorized'}
        </Link>
        <ChevronRight size={16} className="mx-2" />
        <span className="text-gray-700">{product.name}</span>
      </nav>

      {/* Product Details */}
      <div className="grid md:grid-cols-2 gap-12">
        {/* Product Image */}
      <div className="bg-gray-100 rounded-lg overflow-hidden">
        <img
          src={selectedImage || product.mainImage || product.image || '/placeholder.svg'}
          alt={product.name}
          className="w-full h-auto object-cover"
        />
        {product.images && product.images.length > 1 && (
          <div className="flex gap-2 mt-2 justify-center">
            {product.images.map((img: string, idx: number) => (
              <img
                key={img}
                src={img}
                alt={`Thumbnail ${idx + 1}`}
                className={`w-16 h-16 object-cover rounded border-2 cursor-pointer ${selectedImage === img ? 'border-hello260-green' : 'border-gray-200'}`}
                onClick={() => setSelectedImage(img)}
              />
            ))}
          </div>
        )}
      </div>

        {/* Product Info */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">{product.name}</h1>
          <p className="text-2xl text-hello260-green font-bold mb-4">{formatZMW(product.price)}</p>
          
          {/* Reviews */}
          <div className="flex items-center mb-6">
            <div className="flex text-yellow-400 mr-2">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 fill-current ${
                    i < Math.floor(product.rating || 0) ? "text-yellow-400" : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-600">
              {product.rating || "0"} ({product.numReviews || 0} reviews)
            </span>
          </div>
          
          <p className="text-gray-700 mb-8">{product.description}</p>
          
          {/* Quantity Selector */}
          <div className="flex items-center mb-6">
            <span className="mr-4 text-gray-700">Quantity:</span>
            <div className="flex items-center border border-gray-300 rounded-md">
              <button
                onClick={decrementQuantity}
                className="px-3 py-2 hover:bg-gray-100"
                disabled={quantity === 1}
              >
                <Minus size={16} />
              </button>
              <span className="px-4 py-2 border-l border-r border-gray-300 min-w-[40px] text-center">
                {quantity}
              </span>
              <button
                onClick={incrementQuantity}
                className="px-3 py-2 hover:bg-gray-100"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          {/* Stock Status */}
          <div className="mb-6">
            <span className={`inline-block px-3 py-1 text-sm rounded-full ${
              (product.countInStock ?? 0) > 0 
                ? "bg-green-100 text-green-800" 
                : "bg-red-100 text-red-800"
            }`}>
              {(product.countInStock ?? 0) > 0 ? "In Stock" : "Out of Stock"}
            </span>
          </div>
          
          {/* Add to Cart Button */}
          <Button 
            onClick={handleAddToCart}
            disabled={(product.countInStock ?? 0) <= 0}
            className="w-full bg-hello260-green hover:bg-hello260-green/90 text-white mb-6"
          >
            {(product.countInStock ?? 0) > 0 ? (
              <>
                <ShoppingCart size={16} className="mr-2" />
                Add to Cart
              </>
            ) : "Out of Stock"}
          </Button>
          
          {/* Sustainable Product Badge */}
          <div className="flex items-center p-4 bg-hello260-cream/50 rounded-lg">
            <div className="mr-4 text-hello260-green">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-hello260-green">100% Organic & Sustainable</p>
              <p className="text-sm text-gray-600">Ethically sourced ingredients, eco-friendly packaging</p>
            </div>
          </div>
        </div>
      </div>

      {/* Product Details Tabs */}
      <div className="mt-16">
        <Tabs defaultValue="details">
          <TabsList className="w-full grid grid-cols-3 max-w-md mb-8">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="how-to-use">How to Use</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="p-6 bg-white rounded-lg border border-gray-100 shadow-sm">
            <h3 className="font-bold text-lg mb-4">Product Details</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Description</h4>
                <p className="text-gray-700">{product.description}</p>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Ingredients</h4>
                <p className="text-gray-700">{product.ingredients || "Information not available"}</p>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Benefits</h4>
                <p className="text-gray-700">{product.benefits || "Information not available"}</p>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Size</h4>
                <p className="text-gray-700">{product.size || "Information not available"}</p>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="how-to-use" className="p-6 bg-white rounded-lg border border-gray-100 shadow-sm">
            <h3 className="font-bold text-lg mb-4">How to Use</h3>
            <p className="text-gray-700">{product.howToUse || "Information not available"}</p>
          </TabsContent>
          
          <TabsContent value="reviews" className="p-6 bg-white rounded-lg border border-gray-100 shadow-sm">
            <h3 className="font-bold text-lg mb-4">Customer Reviews</h3>
            {product.reviews && product.reviews.length > 0 ? (
              <div className="space-y-6">
                {product.reviews.map((review, index) => (
                  <div key={index} className="border-b border-gray-100 pb-4 last:border-b-0">
                    <div className="flex items-center mb-2">
                      <div className="flex text-yellow-400 mr-2">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3 w-3 fill-current ${
                              i < review.rating ? "text-yellow-400" : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="font-medium">{review.name}</span>
                    </div>
                    <p className="text-gray-700">{review.comment}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No reviews yet. Be the first to review this product!</p>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mt-16">
          <h2 className="heading-md mb-8">You might also like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((product) => (
              <div 
                key={product._id}
                className="bg-white rounded-lg overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
              >
                <Link to={`/products/${product._id}`}>
                  <img 
                    src={product.mainImage || (product.images && product.images[0]) || ''}
                    alt={product.name}
                    className="w-full h-48 object-cover"
                  />
                </Link>
                <div className="p-4">
                  <Link to={`/products/${product._id}`}>
                    <h3 className="font-medium mb-2 hover:text-hello260-green transition-colors">
                      {product.name}
                    </h3>
                  </Link>
                  <p className="font-semibold">{formatZMW(product.price)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailPage;
