import { useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  Minus, 
  Plus, 
  Trash2, 
  ChevronRight, 
  ShoppingCart, 
  ArrowRight,
  ImageIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { formatZMW } from "@/utils/currencyUtils";

const CartPage = () => {
  const { state, updateQuantity, removeItem } = useCart();
  const { items, totalAmount } = state;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const incrementQuantity = (id: string, currentQty: number) => {
    updateQuantity(id, currentQty + 1);
  };

  const decrementQuantity = (id: string, currentQty: number) => {
    if (currentQty > 1) {
      updateQuantity(id, currentQty - 1);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container-custom py-12 text-center">
        <div className="max-w-md mx-auto">
          <div className="flex justify-center mb-6">
            <ShoppingCart size={64} className="text-gray-300" />
          </div>
          <h1 className="text-2xl font-bold mb-4">Your Cart is Empty</h1>
          <p className="text-gray-600 mb-8">
            Looks like you haven't added any products to your cart yet.
          </p>
          <Link to="/products">
            <Button className="bg-hello260-green hover:bg-hello260-green/90 text-white">
              Browse Products
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-custom py-12">
      {/* Breadcrumbs */}
      <nav className="flex text-sm text-gray-500 mb-8">
        <Link to="/" className="hover:text-hello260-green">Home</Link>
        <ChevronRight size={16} className="mx-2" />
        <span className="text-gray-700">Cart</span>
      </nav>
      
      <h1 className="text-3xl font-bold mb-8">Your Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="hidden sm:grid grid-cols-12 gap-4 p-4 border-b border-gray-200 bg-gray-50">
              <div className="col-span-6 font-medium">Product</div>
              <div className="col-span-2 font-medium text-center">Quantity</div>
              <div className="col-span-2 font-medium text-right">Price</div>
              <div className="col-span-2 font-medium text-right">Total</div>
            </div>

            {items.map((item) => (
              <div key={item.id} className="p-4 sm:p-6 border-b border-gray-200 last:border-0">
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                  {/* Product */}
                  <div className="sm:col-span-6 flex items-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-md flex items-center justify-center mr-4 overflow-hidden">
                      {item.image ? (
                        <img 
                          src={item.image} 
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ImageIcon className="text-gray-400" size={24} />
                      )}
                    </div>
                    <div>
                      <Link to={`/products/${item.id}`} className="font-medium hover:text-hello260-green transition-colors">
                        {item.name}
                      </Link>
                      <div className="sm:hidden text-sm text-gray-600 mt-1">
                        {formatZMW(item.price)}
                      </div>
                    </div>
                  </div>
                  
                  {/* Quantity */}
                  <div className="sm:col-span-2 flex items-center justify-between sm:justify-center">
                    <span className="sm:hidden text-sm text-gray-500">Quantity:</span>
                    <div className="flex items-center border border-gray-300 rounded-md">
                      <button
                        onClick={() => decrementQuantity(item.id, item.quantity)}
                        className="px-2 py-1 hover:bg-gray-100"
                        disabled={item.quantity === 1}
                        aria-label="Decrease quantity"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="px-3 py-1 border-l border-r border-gray-300 min-w-[40px] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => incrementQuantity(item.id, item.quantity)}
                        className="px-2 py-1 hover:bg-gray-100"
                        aria-label="Increase quantity"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                  
                  {/* Price */}
                  <div className="hidden sm:block sm:col-span-2 text-right">
                    {formatZMW(item.price)}
                  </div>
                  
                  {/* Total */}
                  <div className="sm:col-span-2 flex justify-between sm:justify-end items-center">
                    <span className="sm:hidden text-sm text-gray-500">Total:</span>
                    <span className="font-medium">{formatZMW(item.price * item.quantity)}</span>
                  </div>

                  {/* Remove */}
                  <div className="flex justify-end sm:justify-center">
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                      aria-label="Remove item"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Continue Shopping */}
          <div className="mt-6">
            <Link to="/products">
              <Button variant="outline" className="text-gray-600">
                &larr; Continue Shopping
              </Button>
            </Link>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span>{formatZMW(totalAmount)}</span>
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold">Total</span>
                <span className="text-lg font-bold">{formatZMW(totalAmount)}</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Taxes calculated at checkout</p>
            </div>
            
            <Link to="/checkout">
              <Button className="w-full bg-hello260-green hover:bg-hello260-green/90 text-white">
                Proceed to Checkout 
                <ArrowRight size={16} className="ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
