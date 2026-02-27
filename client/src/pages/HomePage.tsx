import { 
  ArrowRight, 
  ShoppingCart, 
  Loader2, 
  Sparkles, 
  HeartHandshake, 
  Leaf, 
  Star, 
  Mail, 
  Zap,
  Droplet,
  Gift,
  ShoppingBag,
  Pill,
  Activity,
  Heart
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useProducts } from "@/hooks/useProducts";
import { useEffect, useState, useRef } from "react";
import { formatZMW } from "@/utils/currencyUtils";
import { useCart } from "@/contexts/CartContext";

// Define an interface for the product object
interface Product {
  _id?: string;
  id?: string | number;
  name: string;
  price: number;
  image?: string;
  description?: string;
  countInStock?: number;
  quantity?: number;
  category?: string;
  isFeatured?: boolean;
  brand?: string;
  rating?: number;
  ingredients?: string;
  benefits?: string;
  size?: string;
  howToUse?: string;
}

const HomePage = () => {
  const { fetchFeaturedProducts, loading } = useProducts();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const { addItem } = useCart();
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    // Only load featured products once
    if (!hasLoadedRef.current) {
      hasLoadedRef.current = true;
      
      const loadFeaturedProducts = async () => {
        try {
          const products = await fetchFeaturedProducts();
          if (products) {
            setFeaturedProducts(products);
          }
        } catch (error) {
          console.error('Error loading featured products:', error);
        }
      };

      loadFeaturedProducts();
    }
  }, [fetchFeaturedProducts]);

  const getProductId = (product: Product, index: number) => {
    if (product._id) return product._id;
    if (product.id !== undefined && product.id !== null) return String(product.id);
    return `${product.name}-${index}`;
  };

  const handleAddToCart = (product: Product, productId: string) => {
    addItem({
      id: productId,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1
    });
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="bg-hello260-cream py-16 md:py-24">
        <div className="container-custom">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 animate-fade-in">
              <div className="inline-flex items-center gap-2 bg-hello260-green-light/20 px-4 py-1 rounded-full text-hello260-green font-medium text-sm">
                <Sparkles size={16} className="text-hello260-green" />
                Trusted Pharmaceutical Care
              </div>
              <h1 className="heading-xl">
                Your Health, <br />
                Our Priority
              </h1>
              <p className="text-lg text-gray-700 max-w-md">
                Find essential medicines and healthcare products at hello260. We provide quality pharmaceutical services for your well-being.
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <Link to="/products">
                  <Button className="bg-hello260-green hover:bg-hello260-green/90 text-white">
                    <ShoppingBag size={18} className="mr-2" />
                    Shop Medicines
                  </Button>
                </Link>
                <Link to="/about">
                  <Button variant="outline" className="border-hello260-green text-hello260-green hover:bg-hello260-green hover:text-white">
                    <HeartHandshake size={18} className="mr-2" />
                    About Us
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative h-80 md:h-[500px] bg-gray-200 rounded-lg">
              <img 
                src="/assets/landingimage.png"
                alt="hello260 Pharmacy" 
                className="absolute inset-0 w-full h-full object-cover rounded-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-16">
        <div className="container-custom">
          <h2 className="heading-md text-center mb-12">Browse Our Categories</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Pain Relief",
                description: "Effective relief for aches and pains",
                link: "/products?category=Pain Relief",
                image: "/assets/1772055200610-brufen.png",
                icon: <Pill size={20} className="text-hello260-green" />
              },
              {
                title: "Antibiotics",
                description: "Prescription medications for infections",
                link: "/products?category=Antibiotics",
                image: "/assets/1772052443130-drug8.png",
                icon: <Activity size={20} className="text-hello260-green" />
              },
              {
                title: "Vitamins",
                description: "Supplements for a healthy life",
                link: "/products?category=Vitamins",
                image: "/assets/1772052443136-drug6.png",
                icon: <Heart size={20} className="text-hello260-green" />
              },
            ].map((category, index) => (
              <div
                key={index}
                className="group bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="h-48 bg-gray-100 relative">
                  <img 
                    src={category.image}
                    alt={`${category.title} category`}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-2">
                    {category.icon}
                    <h3 className="text-xl font-bold">{category.title}</h3>
                  </div>
                  <p className="text-gray-600 mb-4">{category.description}</p>
                  <Link
                    to={category.link}
                    className="inline-flex items-center text-hello260-green hover:text-hello260-green-light font-medium"
                  >
                    Explore
                    <ArrowRight size={16} className="ml-2" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Mission Section */}
      <section className="bg-hello260-green py-16">
        <div className="container-custom">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="relative h-80 md:h-[400px] bg-gray-200 rounded-lg">
              <img 
                src="/assets/ourcommitment.png"
                alt="hello260 Mission"
                className="absolute inset-0 w-full h-full object-cover rounded-lg"
              />
            </div>
            <div className="space-y-6 text-white">
              <div className="flex items-center gap-3 mb-2">
                <HeartHandshake size={28} className="text-white" />
                <h2 className="heading-lg">Our Commitment</h2>
              </div>
              <p className="text-gray-100">
                hello260 is dedicated to improving community health by providing accessible, high-quality pharmaceutical products and services.
                We strive to be your trusted partner in health, offering professional advice and a wide range of medicines.
              </p>
              <p className="text-gray-100">
                 With a focus on patient care and safety, our pharmacy ensures that every product meets the highest standards of quality and efficacy.
                 We are committed to serving our community with integrity and compassion.
              </p>
              <p className="text-gray-100">
               Your health is our priority. Whether you need prescription medications, over-the-counter remedies, or health advice, hello260 is here to support you on your wellness journey.
              </p>
              <Link to="/about">
                <Button className="bg-white text-hello260-green hover:bg-gray-100">
                  <Zap size={18} className="mr-2" />
                  Learn More About Us
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16">
        <div className="container-custom">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles size={24} className="text-hello260-green" />
            <h2 className="heading-md text-center">Featured Products</h2>
          </div>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Explore our best-selling products crafted with care by our cooperative members
          </p>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-hello260-green" />
            </div>
          ) : featuredProducts.length === 0 ? (
            <p className="text-center text-gray-500">No featured products available at the moment.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product, index) => {
                const productId = getProductId(product, index);
                return (
                <div 
                  key={productId}
                  className="group bg-white rounded-lg overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
                >
                  <Link to={`/products/${productId}`}>
                    <div className="relative">
                      <img 
                        src={product.image}
                        alt={product.name}
                        className="w-full h-48 object-cover"
                      />
                      {product.isFeatured && (
                        <div className="absolute top-2 right-2 bg-hello260-green text-white text-xs px-2 py-1 rounded-full flex items-center">
                          <Star size={12} className="mr-1" fill="white" /> Featured
                        </div>
                      )}
                    </div>
                  </Link>
                  <div className="p-4">
                    <Link to={`/products/${productId}`}>
                      <h3 className="font-medium mb-2 hover:text-hello260-green transition-colors">{product.name}</h3>
                    </Link>
                    {product.size && (
                      <p className="text-xs text-gray-500 mb-2">{product.size}</p>
                    )}
                    <div className="flex justify-between items-center">
                      <p className="font-semibold">{formatZMW(product.price)}</p>
                      <Button 
                        size="sm"
                        onClick={() => handleAddToCart(product, productId)}
                        className="bg-hello260-green hover:bg-hello260-green/90 text-white"
                      >
                        <ShoppingCart size={16} className="mr-1" /> Add
                      </Button>
                    </div>
                  </div>
                </div>
              )})}
            </div>
          )}

          <div className="text-center mt-10">
            <Link to="/products">
              <Button variant="outline" className="border-hello260-green text-hello260-green hover:bg-hello260-green hover:text-white">
                <ShoppingBag size={18} className="mr-2" />
                View All Products
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-hello260-cream py-16">
        <div className="container-custom">
          <div className="flex items-center justify-center gap-3 mb-12">
            <Star size={24} className="text-hello260-green" fill="currentColor" />
            <h2 className="heading-md text-center">What Our Customers Say</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                quote: "hello260 has been my go-to pharmacy for years. Their staff is knowledgeable and always ready to help with my prescriptions.",
                author: "Sarah M.",
                location: "Lusaka, Zambia",
              },
              {
                quote: "I found exactly what I needed for my recovery. The range of products is impressive and the prices are very reasonable.",
                author: "John D.",
                location: "Ndola, Zambia",
              },
              {
                quote: "Excellent service and genuine products. I trust hello260 for all my family's health needs.",
                author: "Emily R.",
                location: "Livingstone, Zambia",
              },
            ].map((testimonial, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="flex mb-4 text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} fill="currentColor" />
                  ))}
                </div>
                <p className="text-gray-600 italic mb-4">{testimonial.quote}</p>
                <p className="font-bold">{testimonial.author}</p>
                <p className="text-sm text-gray-500">{testimonial.location}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-hello260-green-light/20">
        <div className="container-custom text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Mail size={24} className="text-hello260-green" />
            <h2 className="heading-lg text-hello260-green">Join Our Journey</h2>
          </div>
          <p className="text-gray-700 max-w-2xl mx-auto mb-8">
            Support our mission by exploring our products and becoming part of our story. Sign up for our newsletter to receive updates and exclusive offers.
          </p>
          <div className="max-w-md mx-auto flex flex-col sm:flex-row gap-2">
            <input
              type="email"
              placeholder="Your email address"
              className="flex-grow px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-hello260-green focus:border-transparent"
            />
            <Button className="bg-hello260-green hover:bg-hello260-green/90 text-white">
              <Mail size={18} className="mr-2" />
              Subscribe
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
