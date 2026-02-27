import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Package, ShoppingCart, TrendingUp, Loader2, Calendar, CreditCard } from "lucide-react";
import { useOrders } from "@/hooks/useOrders";
import { useProducts } from "@/hooks/useProducts";
import { useUsers } from "@/hooks/useUsers";
import { formatZMW } from "@/utils/currencyUtils";

interface Stats {
  totalSales: number;
  totalCustomers: number;
  totalProducts: number;
  pendingOrders: number;
}

interface StatCard {
  title: string;
  value: string | number;
  description: string;
  icon: JSX.Element;
  color: string;
}

const DashboardHome = () => {
  const { orders, loading: ordersLoading, getAllOrders } = useOrders();
  const { products, loading: productsLoading, fetchProducts } = useProducts();
  const { users, loading: usersLoading, getAllUsers } = useUsers();
  
  const [salesData, setSalesData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({
    totalSales: 0,
    totalCustomers: 0,
    totalProducts: 0,
    pendingOrders: 0,
  });
  
  useEffect(() => {
    // Fetch data from APIs
    const fetchData = async () => {
      try {
        await Promise.all([
          getAllOrders(),
          fetchProducts(),
          getAllUsers()
        ]);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };
    
    fetchData();
  }, [getAllOrders, fetchProducts, getAllUsers]);

  // Calculate stats when data is loaded
  useEffect(() => {
    if (ordersLoading || productsLoading || usersLoading) {
      setIsLoading(true);
      return;
    }
    
    // Calculate total sales
    const totalSales = orders?.reduce((sum, order) => sum + order.totalPrice, 0) || 0;
    
    // Count pending orders
    const pendingOrders = orders?.filter(order => 
      order.status === "Pending" || order.status === "Processing"
    ).length || 0;

    // Count active products (products with stock)
    const activeProducts = products?.filter(product => 
      product.countInStock > 0
    ).length || 0;
    
    // Set stats
    setStats({
      totalSales,
      totalCustomers: users?.length || 0,
      totalProducts: activeProducts,
      pendingOrders,
    });
    
    // Generate monthly sales data
    if (orders?.length) {
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const currentYear = new Date().getFullYear();
      
      // Initialize monthly data
      const monthlySales = monthNames.map(name => ({ name, amount: 0 }));
      
      // Aggregate orders by month for current year
      orders.forEach(order => {
        const orderDate = new Date(order.createdAt);
        if (orderDate.getFullYear() === currentYear && order.isPaid) {
          const monthIndex = orderDate.getMonth();
          monthlySales[monthIndex].amount += order.totalPrice;
        }
      });
      
      // Only include months up to the current month
      const currentMonth = new Date().getMonth();
      setSalesData(monthlySales.slice(0, currentMonth + 1));
    }
    
      setIsLoading(false);
  }, [orders, products, users, ordersLoading, productsLoading, usersLoading]);

  // Get recent orders
  const recentOrders = orders 
    ? [...orders]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5)
    : [];

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('en-US', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    }).format(date);
  };

  return (
    <div className="px-2 sm:px-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-2">
        <h1 className="text-xl sm:text-2xl font-bold">Dashboard</h1>
        <p className="text-gray-500 text-sm sm:text-base">Welcome back, Admin</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
        {([
          {
            title: "Total Sales",
            value: formatZMW(stats.totalSales),
            description: "Lifetime sales",
            icon: <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />,
            color: "bg-green-50 border-green-200",
          },
          {
            title: "Customers",
            value: stats.totalCustomers,
            description: "Registered users",
            icon: <Users className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />,
            color: "bg-blue-50 border-blue-200",
          },
          {
            title: "Products",
            value: stats.totalProducts,
            description: "Products in stock",
            icon: <Package className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />,
            color: "bg-purple-50 border-purple-200",
          },
          {
            title: "Pending Orders",
            value: stats.pendingOrders,
            description: "Require action",
            icon: <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600" />,
            color: "bg-amber-50 border-amber-200",
          },
        ] as StatCard[]).map((stat, index) => (
          <Card key={index} className={`border ${stat.color}`}>
            <CardHeader className="pb-2 space-y-0">
              <div className="flex justify-between items-start">
                <CardTitle className="text-sm font-medium text-gray-500">{stat.title}</CardTitle>
                {stat.icon}
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-8 w-3/4 bg-gray-200 rounded animate-pulse"></div>
              ) : (
                <div>
                  <div className="text-xl sm:text-2xl font-bold">{stat.value}</div>
                  <CardDescription className="text-xs sm:text-sm">{stat.description}</CardDescription>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-6 mb-6 sm:mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Revenue Overview</CardTitle>
            <CardDescription className="text-sm">Monthly revenue for the current year</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] sm:h-80">
            {isLoading ? (
              <div className="h-full w-full bg-gray-100 rounded flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-hello260-green" />
              </div>
            ) : salesData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} width={60} />
                  <Tooltip formatter={(value) => [formatZMW(value), "Revenue"]} />
                  <Bar dataKey="amount" fill="#3E5641" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full w-full flex items-center justify-center text-gray-500 text-sm">
                No sales data available for this year
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Recent Orders</CardTitle>
            <CardDescription className="text-sm">Latest 5 customer orders</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-100 rounded animate-pulse"></div>
                ))}
              </div>
            ) : recentOrders.length > 0 ? (
              <div className="space-y-3">
                {recentOrders.map((order) => (
                  <div key={order._id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-gray-400" />
                        <span className="text-sm text-gray-600">{formatDate(order.createdAt)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CreditCard size={14} className="text-gray-400" />
                        <span className="font-medium">{formatZMW(order.totalPrice)}</span>
                      </div>
                    </div>
                    <div className="mt-2 sm:mt-0">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                        order.status === 'Processing' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'Pending' ? 'bg-amber-100 text-amber-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 text-sm py-8">
                No recent orders
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardHome;
