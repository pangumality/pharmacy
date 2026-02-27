import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2, Package, User, LogOut, ShoppingBag, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useOrders } from "@/hooks/useOrders";
import { formatZMW } from "@/utils/currencyUtils";

const UserAccountPage = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { getUserOrders, loading, orders } = useOrders();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("profile");

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login?redirect=account");
    }
  }, [isAuthenticated, navigate]);

  // Load orders when the orders tab is active
  useEffect(() => {
    if (isAuthenticated && activeTab === "orders") {
      getUserOrders();
    }
  }, [isAuthenticated, activeTab, getUserOrders]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="container-custom py-12 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-hello260-green mx-auto" />
        <p className="mt-4">Loading your account...</p>
      </div>
    );
  }

  return (
    <div className="container-custom py-12">
      {/* Breadcrumbs */}
      <nav className="flex text-sm text-gray-500 mb-8">
        <Link to="/" className="hover:text-hello260-green">Home</Link>
        <ChevronRight size={16} className="mx-2" />
        <span className="text-gray-700">My Account</span>
      </nav>
      
      <h1 className="text-3xl font-bold mb-8">My Account</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-hello260-green/20 flex items-center justify-center text-hello260-green mr-4">
                  <User size={24} />
                </div>
                <div>
                  <h2 className="font-bold">{user.firstName} {user.lastName}</h2>
                  <p className="text-sm text-gray-600">{user.email}</p>
                </div>
              </div>
            </div>
            
            <div className="p-4">
              <Button variant="ghost" onClick={handleLogout} className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50">
                <LogOut size={18} className="mr-2" />
                Log Out
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="md:col-span-3">
          <Tabs defaultValue="profile" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-2 w-full max-w-md mb-8">
              <TabsTrigger value="profile" className="text-sm">
                <User size={16} className="mr-2" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="orders" className="text-sm">
                <ShoppingBag size={16} className="mr-2" />
                Order History
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-xl font-bold mb-6">Profile Information</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">First Name</h3>
                    <p>{user.firstName || 'Not provided'}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Last Name</h3>
                    <p>{user.lastName || 'Not provided'}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Email</h3>
                    <p>{user.email}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Account Type</h3>
                    <p>{user.isAdmin ? 'Administrator' : 'Customer'}</p>
                  </div>
                </div>
                
                <div className="mt-8">
                  <Button variant="outline" className="text-hello260-green border-hello260-green hover:bg-hello260-green hover:text-white">
                    Edit Profile
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="orders">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-xl font-bold mb-6">Order History</h2>
                
                {loading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-hello260-green" />
                  </div>
                ) : orders && orders.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="px-4 py-3 text-left">Order ID</th>
                          <th className="px-4 py-3 text-left">Date</th>
                          <th className="px-4 py-3 text-left">Status</th>
                          <th className="px-4 py-3 text-right">Total</th>
                          <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map((order) => (
                          <tr key={order._id} className="border-b">
                            <td className="px-4 py-3">
                              #{order._id.substring(0, 8)}
                            </td>
                            <td className="px-4 py-3">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-1 rounded-full text-xs capitalize ${
                                order.isDelivered ? 'bg-green-100 text-green-800' : 
                                order.isPaid ? 'bg-blue-100 text-blue-800' : 
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {order.isDelivered ? 'Delivered' : 
                                 order.isPaid ? 'Processing' : 
                                 'Pending'}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right font-medium">
                              {formatZMW(order.totalAmount)}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <Link to={`/checkout/success?orderId=${order._id}`}>
                                <Button variant="outline" size="sm">
                                  View Details
                                </Button>
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <Package size={48} className="mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Orders Yet</h3>
                    <p className="text-gray-600 mb-6">You haven't placed any orders yet.</p>
                    <Link to="/products">
                      <Button className="bg-hello260-green hover:bg-hello260-green/90 text-white">
                        Start Shopping
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default UserAccountPage; 