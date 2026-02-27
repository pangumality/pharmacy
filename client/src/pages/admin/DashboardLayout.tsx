import { useState, useEffect, useRef } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  ShoppingCart, 
  LogOut, 
  Menu,
  X,
  Home
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import { useAuth } from "@/contexts/AuthContext";
import { orderApi } from "@/lib/api";

const DashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const lastOrderInfoRef = useRef<{count: number, latestOrderId: string | null} | null>(null);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, isAdmin } = useAuth();

  // Poll for new orders
  useEffect(() => {
    // Only poll if user is admin
    if (!isAdmin) return;
    
    const checkNewOrders = async () => {
      try {
        const stats = await orderApi.getOrderStats();
        
        if (lastOrderInfoRef.current) {
          const prev = lastOrderInfoRef.current;
          // If we have previous info and the count or latest order ID has changed
          if (stats.count > prev.count || 
              (stats.latestOrderId && stats.latestOrderId !== prev.latestOrderId)) {
            
            toast.success("New Order Received!", {
              description: `A new order has been placed.`,
              action: {
                label: "View Orders",
                onClick: () => navigate("/admin/orders")
              },
              duration: 5000,
            });

            // Optional: Play sound
             try {
               const audio = new Audio('/assets/notification.mp3');
               audio.play().catch(() => {});
             } catch (e) {
               // Ignore
             }
          }
        }
        
        lastOrderInfoRef.current = {
          count: stats.count,
          latestOrderId: stats.latestOrderId
        };
      } catch (error) {
        console.error("Error checking for new orders:", error);
      }
    };

    // Initial check
    checkNewOrders();

    // Set up polling interval (every 30 seconds)
    const interval = setInterval(checkNewOrders, 30000);

    return () => clearInterval(interval);
  }, [isAdmin, navigate]);

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);

    return () => {
      window.removeEventListener("resize", checkIfMobile);
    };
  }, []);

  // Close sidebar on route change for mobile
  useEffect(() => {
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  }, [location.pathname, isMobile]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  const navItems = [
    { path: "/admin", label: "Dashboard", icon: <LayoutDashboard size={20} /> },
    { path: "/admin/products", label: "Products", icon: <Package size={20} /> },
    { path: "/admin/customers", label: "Customers", icon: <Users size={20} /> },
    { path: "/admin/orders", label: "Orders", icon: <ShoppingCart size={20} /> },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-30">
        <div className="px-3 sm:px-4 h-14 sm:h-16 flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={toggleSidebar}
              className="p-1.5 sm:p-2 rounded-md text-gray-600 hover:bg-gray-100"
              aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
            >
              {isSidebarOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
            <img src="/logo.png" alt="Logo" className="h-8 sm:h-10 w-auto ml-3 sm:ml-4 object-contain" />
            <h1 className="ml-2 text-lg sm:text-xl font-bold text-hello260-green">hello260 Admin</h1>
          </div>

          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm"
              asChild
              className="hidden sm:flex text-gray-600 hover:text-hello260-green"
            >
              <NavLink to="/">
                <Home size={18} className="mr-2" /> Website
              </NavLink>
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleLogout} 
              className="text-gray-600 hover:text-hello260-green"
            >
              <LogOut size={18} className="sm:mr-2" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="pt-14 sm:pt-16 flex">
        {/* Sidebar */}
        <aside
          className={`${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          } fixed md:relative z-20 bg-white border-r border-gray-200 h-[calc(100vh-56px)] sm:h-[calc(100vh-64px)] w-64 transition-transform duration-300 ease-in-out`}
        >
          <div className="p-3 sm:p-4">
            <nav className="space-y-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === "/admin"}
                  onClick={() => isMobile && setIsSidebarOpen(false)}
                  className={({ isActive }) => `
                    flex items-center px-3 sm:px-4 py-2.5 sm:py-3 text-sm font-medium rounded-md
                    ${
                      isActive
                        ? "bg-hello260-green text-white"
                        : "text-gray-700 hover:bg-gray-100"
                    }
                  `}
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.label}
                </NavLink>
              ))}

              <hr className="my-3 sm:my-4 border-gray-200" />

              <NavLink
                to="/"
                className="flex items-center px-3 sm:px-4 py-2.5 sm:py-3 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100 md:hidden"
                onClick={() => isMobile && setIsSidebarOpen(false)}
              >
                <Home size={20} className="mr-3" />
                Back to Website
              </NavLink>
            </nav>
          </div>
        </aside>

        {/* Mobile backdrop */}
        {isMobile && isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-10"
            onClick={() => setIsSidebarOpen(false)}
          ></div>
        )}

        {/* Main content */}
        <main className="flex-1 p-4 sm:p-6 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
