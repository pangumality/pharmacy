import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronRight, CreditCard, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useOrders } from "@/hooks/useOrders";
import { formatZMW } from "@/utils/currencyUtils";
import { toast } from "@/components/ui/sonner";
import { fetchApi } from "@/lib/api"; // Import fetchApi for verification

type LencoPaySuccessResponse = {
  reference: string;
};

type LencoPayConfig = {
  key: string;
  reference: string;
  email: string;
  amount: number;
  currency: string;
  channels: string[];
  customer: {
    firstName: string;
    lastName: string;
    phone: string;
  };
  onSuccess: (response: LencoPaySuccessResponse) => void;
  onClose: () => void;
  onConfirmationPending: () => void;
};

type LencoPay = {
  getPaid: (config: LencoPayConfig) => void;
};

// Add global declaration for LencoPay
declare global {
  interface Window {
    LencoPay?: LencoPay;
  }
}

const formSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phoneNumber: z.string().min(10, "Phone number is required"),
  address: z.string().min(5, "Address is required"),
  city: z.string().min(2, "City is required"),
  province: z.string().min(2, "Province is required"),
  zipCode: z.string().min(1, "Postal/ZIP code is required"),
  paymentMethod: z.enum(["airtel", "mtn", "creditCard"]),
});

type CheckoutFormValues = z.infer<typeof formSchema>;

const CheckoutPage = () => {
  const { state, clearCart } = useCart();
  const { items, totalAmount } = state;
  const { isAuthenticated, user } = useAuth();
  const { createOrder } = useOrders();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load Lenco Script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://pay.lenco.co/js/v1/inline.js";
    script.async = true;
    document.body.appendChild(script);
    
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // If not authenticated, redirect to login
  useEffect(() => {
    if (!isAuthenticated) {
      toast.error("Please login to checkout");
      navigate("/login?redirect=checkout");
    }
  }, [isAuthenticated, navigate]);

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      phoneNumber: "",
      address: "",
      city: "",
      province: "",
      zipCode: "",
      paymentMethod: "airtel",
    },
  });

  // Update form values when user data loads
  useEffect(() => {
    if (user) {
      form.setValue("firstName", user.firstName || "");
      form.setValue("lastName", user.lastName || "");
      form.setValue("email", user.email || "");
    }
  }, [user, form]);

  const handleLencoPayment = async (values: CheckoutFormValues, total: number) => {
    if (!window.LencoPay) {
      toast.error("Payment system is not loaded yet. Please refresh the page.");
      setIsSubmitting(false);
      return;
    }

    const channels = values.paymentMethod === "creditCard" ? ["card"] : ["mobile-money"];
    
    try {
      window.LencoPay.getPaid({
        key: import.meta.env.VITE_LENCO_PUBLIC_KEY || "YOUR_PUBLIC_KEY", // Use env var or fallback
        reference: `ref-${Date.now()}`,
        email: values.email,
        amount: total,
        currency: "ZMW",
        channels: channels,
        customer: {
          firstName: values.firstName,
          lastName: values.lastName,
          phone: values.phoneNumber,
        },
        onSuccess: async function (response: LencoPaySuccessResponse) {
          try {
            toast.info("Verifying payment...");
            
            // Verify payment on backend
            const verifyResult = await fetchApi(`/payment/verify/${response.reference}`);
            
            if (verifyResult && verifyResult.status) {
              toast.success("Payment successful!");
              await processOrderCreation(values, total, response.reference, verifyResult?.data);
            } else {
              toast.error("Payment verification failed. Please contact support.");
              setIsSubmitting(false);
            }
          } catch (error) {
            console.error("Verification error:", error);
            toast.error("Payment verification failed");
            setIsSubmitting(false);
          }
        },
        onClose: function () {
          toast.info("Payment cancelled");
          setIsSubmitting(false);
        },
        onConfirmationPending: function () {
          toast.info("Payment confirmation pending");
          setIsSubmitting(false);
        },
      });
    } catch (error) {
      console.error("Lenco init error:", error);
      toast.error("Failed to initialize payment");
      setIsSubmitting(false);
    }
  };

  const processOrderCreation = async (
    values: CheckoutFormValues,
    total: number,
    paymentReference?: string,
    verificationData?: unknown
  ) => {
    try {
      // Transform cart items to order items format
      const orderItems = items.map(item => ({
        name: item.name,
        quantity: item.quantity,
        image: item.image,
        price: item.price,
        product: item.id, // This is now the MongoDB _id
      }));
      
      const taxAmount = totalAmount * 0.16; // 16% tax
      const shippingAmount = 0;
      
      // Create order object
      const orderData = {
        orderItems,
        shippingAddress: {
          firstName: values.firstName,
          lastName: values.lastName,
          address: values.address,
          city: values.city,
          province: values.province,
          zipCode: values.zipCode,
          phoneNumber: values.phoneNumber,
          email: values.email,
        },
        paymentMethod: values.paymentMethod,
        paymentResult: paymentReference
          ? { provider: "lenco", reference: paymentReference, verificationData: verificationData || null }
          : undefined,
        taxAmount,
        shippingAmount,
        totalAmount: total,
      };
      
      // Submit order to API
      const result = await createOrder(orderData);
      
      if (result) {
        clearCart();
        navigate(`/checkout/success?orderId=${result._id}`);
      }
    } catch (error) {
      console.error("Order submission error:", error);
      toast.error("There was a problem processing your order");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmit = async (values: CheckoutFormValues) => {
    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }
    
    setIsSubmitting(true);
    
    // Calculate total including tax and shipping
    const taxAmount = totalAmount * 0.16;
    const shippingAmount = 0;
    const finalTotal = totalAmount + taxAmount + shippingAmount;

    // Initiate Lenco Payment
    handleLencoPayment(values, finalTotal);
  };

  if (!isAuthenticated) {
    return (
      <div className="container-custom py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Please login to checkout</h1>
        <p className="text-gray-600 mb-8">You need to be logged in to complete your purchase.</p>
        <Link to="/login?redirect=checkout">
          <Button className="bg-hello260-green hover:bg-hello260-green/90 text-white">
            Login to Checkout
          </Button>
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container-custom py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
        <p className="text-gray-600 mb-8">Add some products to your cart before checking out.</p>
        <Link to="/products">
          <Button className="bg-hello260-green hover:bg-hello260-green/90 text-white">
            Browse Products
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
        <Link to="/cart" className="hover:text-hello260-green">Cart</Link>
        <ChevronRight size={16} className="mx-2" />
        <span className="text-gray-700">Checkout</span>
      </nav>
      
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Checkout Form */}
        <div className="lg:col-span-2">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Contact Information */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-xl font-bold mb-4">Contact Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input type="tel" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-xl font-bold mb-4">Shipping Address</h2>
                <div className="grid grid-cols-1 gap-4">
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="province"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Province</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="zipCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Postal/ZIP Code</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-xl font-bold mb-4">Payment Method</h2>
                <FormField
                  control={form.control}
                  name="paymentMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="space-y-3"
                        >
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="airtel" />
                            </FormControl>
                            <FormLabel className="font-normal flex items-center">
                              <Smartphone size={18} className="mr-2 text-red-600" />
                              Airtel Money
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="mtn" />
                            </FormControl>
                            <FormLabel className="font-normal flex items-center">
                              <Smartphone size={18} className="mr-2 text-yellow-500" />
                              MTN Mobile Money
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="creditCard" />
                            </FormControl>
                            <FormLabel className="font-normal flex items-center">
                              <CreditCard size={18} className="mr-2" />
                              Credit / Debit Card
                            </FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Back to Cart and Continue */}
              <div className="flex flex-col sm:flex-row justify-between gap-4">
                <Link to="/cart">
                  <Button type="button" variant="outline" className="w-full sm:w-auto">
                    &larr; Back to Cart
                  </Button>
                </Link>
                <Button 
                  type="submit" 
                  className="w-full sm:w-auto bg-hello260-green hover:bg-hello260-green/90 text-white"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Processing..." : "Place Order"}
                </Button>
              </div>
            </form>
          </Form>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-20">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>
            
            {/* Order Items */}
            <div className="space-y-4 mb-6">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between">
                  <div className="flex items-center">
                    <span className="text-gray-600">{item.quantity} x</span>
                    <span className="ml-2 font-medium">{item.name}</span>
                  </div>
                  <span>{formatZMW(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            
            {/* Price Breakdown */}
            <div className="border-t border-gray-200 pt-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span>{formatZMW(totalAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax (16%)</span>
                <span>{formatZMW(totalAmount * 0.16)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-200">
                <span>Total</span>
                <span className="text-hello260-green">
                  {formatZMW(
                    totalAmount + 
                    totalAmount * 0.16
                  )}
                </span>
              </div>
            </div>
            
            {/* Submit Button */}
            <Button 
              type="submit"
              className="w-full mt-6 bg-hello260-green hover:bg-hello260-green/90 text-white"
              onClick={form.handleSubmit(onSubmit)}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Processing...' : 'Complete Order'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
