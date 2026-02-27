import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Search, Filter, X, ShoppingCart, Loader2 } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { formatZMW } from "@/utils/currencyUtils";
import { useProducts } from "@/hooks/useProducts";

// Define an interface for the product object
interface Product {
  id?: number | string;
  _id?: string;
  name: string;
  price: number | string;
  image?: string;
  description?: string;
  countInStock?: number;
  category: string;
  isFeatured?: boolean;
  brand?: string;
  rating?: number;
  ingredients?: string;
  benefits?: string;
  size?: string;
  howToUse?: string;
  mainImage?: string;
  images?: string[];
}

// Define an interface for filter params
interface FilterParams {
  keyword?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  category?: string;
}

// List of product categories
const PRODUCT_CATEGORIES = [
  "Pain Relief",
  "Antibiotics",
  "Vitamins",
  "Supplements",
  "First Aid",
  "Personal Care",
  "Medicine"
];

// Replace mock products with useProducts hook
const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [priceRange, setPriceRange] = useState<number[]>([0, 400]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const { addItem } = useCart();
  
  // Get category from URL params
  const categoryParam = searchParams.get("category");
  const keywordParam = searchParams.get("keyword");

  // Initialize with URL parameters
  useEffect(() => {
    if (categoryParam) {
      setSelectedCategories([categoryParam]);
    }
    if (keywordParam) {
      setSearchTerm(keywordParam);
    }
  }, [categoryParam, keywordParam]);

  // Use the products hook with search parameters
  const { 
    products, 
    loading, 
    error, 
    pagination, 
    fetchProducts 
  } = useProducts();

  // Add a debounce/throttle effect to prevent too many API calls
  const [debouncedFilters, setDebouncedFilters] = useState({
    searchTerm: "",
    priceRange: [0, 400] as number[],
    selectedCategories: [] as string[]
  });

  // Update debounced filters when user filters change
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFilters({
        searchTerm,
        priceRange,
        selectedCategories
      });
    }, 500); // 500ms debounce
    
    return () => clearTimeout(timer);
  }, [searchTerm, priceRange, selectedCategories]);

  // Update search when debounced filters change
  useEffect(() => {
    const params: FilterParams = {
      keyword: debouncedFilters.searchTerm,
      minPrice: debouncedFilters.priceRange[0],
      maxPrice: debouncedFilters.priceRange[1],
      page: 1
    };
    
    if (debouncedFilters.selectedCategories.length > 0) {
      params.category = debouncedFilters.selectedCategories[0]; // API can filter by one category at a time
    }
    
    fetchProducts(params);
    
    // Update URL params
    const searchParams = new URLSearchParams();
    if (debouncedFilters.searchTerm) searchParams.set('keyword', debouncedFilters.searchTerm);
    if (debouncedFilters.selectedCategories.length > 0) 
      searchParams.set('category', debouncedFilters.selectedCategories[0]);
    
    setSearchParams(searchParams, { replace: true });
    
  }, [debouncedFilters, fetchProducts, setSearchParams]);

  const toggleCategory = (category: string) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter(c => c !== category));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setPriceRange([0, 400]);
    setSelectedCategories([]);
    setSearchParams({});
    fetchProducts({});
  };

  const handleAddToCart = (product: Product) => {
    const productId = product._id ?? (product.id != null ? String(product.id) : "");
    addItem({
      id: productId,
      name: product.name,
      price: Number(product.price),
      image: product.image,
      quantity: 1
    });
  };

  return (
    <div className="container-custom py-12">
      <h1 className="heading-lg mb-8">Our Products</h1>
      
      <div className="flex flex-col md:flex-row gap-8">
        {/* Mobile Filter Toggle */}
        <div className="md:hidden flex justify-between items-center mb-4">
          <Button
            variant="outline"
            className="flex items-center gap-2 border-gray-300"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
          >
            <Filter size={16} />
            Filters
          </Button>
          
          <div className="relative w-full max-w-sm">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search products..."
              className="pl-10"
            />
          </div>
        </div>

        {/* Sidebar Filters */}
        <aside className={`w-full md:w-64 ${isFilterOpen ? 'block' : 'hidden'} md:block`}>
          <div className="sticky top-20 bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-lg">Filters</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-sm text-gray-500 hover:text-hello260-green"
              >
                Clear all
              </Button>
            </div>
            
            {/* Search - Desktop */}
            <div className="hidden md:block mb-6">
              <Label className="text-sm font-medium mb-1.5 block">Search</Label>
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search products..."
                  className="pl-10"
                />
              </div>
            </div>
            
            {/* Price Range */}
            <div className="mb-6">
              <Label className="text-sm font-medium mb-3 block">Price Range</Label>
              <Slider
                defaultValue={priceRange}
                value={priceRange}
                onValueChange={setPriceRange}
                min={0}
                max={400}
                step={5}
                className="mb-2"
              />
              <div className="flex justify-between text-sm mt-1 text-gray-600">
                <span>{formatZMW(priceRange[0])}</span>
                <span>{formatZMW(priceRange[1])}</span>
              </div>
            </div>

            {/* Categories */}
            <div className="mb-6">
              <Label className="text-sm font-medium mb-3 block">Categories</Label>
              <div className="space-y-3">
                {PRODUCT_CATEGORIES.map((category) => (
                  <div key={category} className="flex items-center">
                    <Checkbox
                      id={category}
                      checked={selectedCategories.includes(category)}
                      onCheckedChange={() => toggleCategory(category)}
                    />
                    <label
                      htmlFor={category}
                      className="ml-2 text-sm capitalize"
                    >
                      {category.replace("-", " ")}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Mobile Close Button */}
            <Button
              onClick={() => setIsFilterOpen(false)}
              className="md:hidden w-full mt-4 bg-hello260-green hover:bg-hello260-green/90 text-white"
            >
              Apply Filters
            </Button>
          </div>
        </aside>

        {/* Products Grid */}
        <div className="flex-1">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-hello260-green" />
          </div>
          ) : error ? (
            <div className="text-center p-8 bg-red-50 rounded-lg text-red-600">
              <p>Failed to load products. Please try again.</p>
                      </div>
          ) : products?.length === 0 ? (
            <div className="text-center p-8 bg-gray-50 rounded-lg">
              <p className="text-gray-600">No products found matching your criteria.</p>
                    </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products?.map((product, index) => {
                  const productId =
                    product._id ?? (product.id != null ? String(product.id) : `${product.name}-${index}`);

                  return (
                    <div
                      key={productId}
                      className="bg-white rounded-lg overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <Link to={`/products/${productId}`}>
                        <img
                          src={
                            product.mainImage ||
                            (product.images && product.images[0]) ||
                            product.image ||
                            "/placeholder.svg"
                          }
                          alt={product.name}
                          className="w-full h-64 object-cover"
                        />
                      </Link>
                      <div className="p-4">
                        <Link to={`/products/${productId}`}>
                          <h3 className="font-medium text-lg mb-2 hover:text-hello260-green transition-colors">
                            {product.name}
                          </h3>
                        </Link>
                        <div className="flex justify-between items-center">
                          <p className="font-semibold text-lg">{formatZMW(Number(product.price))}</p>
                          <Button
                            size="sm"
                            onClick={() => handleAddToCart(product)}
                            className="bg-hello260-green hover:bg-hello260-green/90 text-white"
                          >
                            <ShoppingCart size={16} className="mr-1" /> Add
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="flex justify-center mt-12">
                  <div className="flex space-x-1">
                    {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                    <Button 
                        key={page}
                        variant={page === pagination.page ? "default" : "outline"}
                        size="sm"
                        className={page === pagination.page ? "bg-hello260-green hover:bg-hello260-green/90" : ""}
                        onClick={() => fetchProducts({ 
                          keyword: searchTerm, 
                          category: selectedCategories[0] || null,
                          page 
                        })}
                    >
                        {page}
                    </Button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
