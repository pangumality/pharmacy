import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useOrders } from "@/hooks/useOrders";
import { formatZMW } from "@/utils/currencyUtils";

const CheckoutSuccessPage = () => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const { getOrderById } = useOrders();
  
  // Get order ID from URL query parameters
  const searchParams = new URLSearchParams(location.search);
  const orderId = searchParams.get('orderId');

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (orderId) {
        try {
          const orderData = await getOrderById(orderId);
          if (orderData) {
            setOrder(orderData);
          }
        } catch (error) {
          console.error("Error fetching order:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
    
    fetchOrderDetails();
  }, [orderId, getOrderById]);

  if (loading) {
    return (
      <div className="container-custom py-12 text-center">
        <div className="spinner">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container-custom py-12 max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Thank You For Your Order!</h1>
        <p className="text-gray-600">
          {order ? `Your order #${order._id.substring(0, 8)} has been received and is being processed.` : 'Your order has been received and is being processed.'}
        </p>
      </div>

      {order && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Order Details</h2>
          
          <div className="space-y-4 mb-6">
            <div className="flex justify-between border-b pb-2">
              <span className="font-medium">Order Number:</span>
              <span>{order._id}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="font-medium">Date:</span>
              <span>{new Date(order.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="font-medium">Payment Method:</span>
              <span className="capitalize">{order.paymentMethod}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="font-medium">Order Status:</span>
              <span className="capitalize">{order.status}</span>
            </div>
          </div>
          
          <h3 className="text-lg font-bold mb-3">Items</h3>
          <div className="space-y-3 mb-6">
            {order.orderItems.map((item, index) => (
              <div key={index} className="flex justify-between">
                <div>
                  <span>{item.name}</span>
                  <span className="text-gray-500 ml-2">x{item.quantity}</span>
                </div>
                <span>{formatZMW(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
          
          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>{formatZMW(order.totalAmount - order.taxAmount - order.shippingAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax:</span>
              <span>{formatZMW(order.taxAmount)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg border-t pt-2">
              <span>Total:</span>
              <span>{formatZMW(order.totalAmount)}</span>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-3 justify-center">
        <Link to="/products">
          <Button variant="outline" className="min-w-[180px]">
            Continue Shopping
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default CheckoutSuccessPage;
