import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Eye, Loader2, Calendar, CreditCard, User2, Package } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useOrders } from "@/hooks/useOrders";
import { formatZMW } from "@/utils/currencyUtils";

// Define types for our data structures
interface OrderItem {
  _id?: string;
  product?: string;
  name: string;
  image?: string;
  price: number;
  quantity: number;
}

interface ShippingAddress {
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

interface PaymentResult {
  id: string;
  status: string;
  update_time: string;
  email_address?: string;
}

interface User {
  _id: string;
  name: string;
  email: string;
}

interface Order {
  id?: number | string;
  _id?: string;
  user?: User;
  orderItems: OrderItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  paymentResult?: PaymentResult;
  itemsPrice: number;
  taxPrice: number;
  shippingPrice: number;
  totalPrice: number;
  isPaid: boolean;
  paidAt?: string;
  isDelivered: boolean;
  deliveredAt?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

const OrdersAdmin = () => {
  const { 
    orders, 
    loading, 
    error, 
    getAllOrders, 
    updateOrderStatus 
  } = useOrders();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    // Load all orders on component mount
    getAllOrders();
  }, [getAllOrders]);

  const filteredOrders = orders ? orders.filter(order => {
    // Apply search filter
    const matchesSearch = 
      (order.id?.toString() || order._id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.user && order.user.name && order.user.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (order.user && order.user.email && order.user.email.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Apply status filter
    const matchesStatus = !statusFilter || statusFilter === "all" || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  }) : [];

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsViewDialogOpen(true);
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      setIsUpdating(true);
      await updateOrderStatus(orderId, newStatus);
      setIsViewDialogOpen(false);
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error("Failed to update order status");
    } finally {
      setIsUpdating(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }).format(date);
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Completed':
      case 'Delivered':
        return 'bg-green-100 text-green-800';
      case 'Processing':
        return 'bg-blue-100 text-blue-800';
      case 'Shipped':
        return 'bg-purple-100 text-purple-800';
      case 'Pending':
        return 'bg-amber-100 text-amber-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="px-2 sm:px-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3">
        <h1 className="text-xl sm:text-2xl font-bold">Orders</h1>
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-3 sm:p-4 border-b">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <Search size={20} className="text-gray-400" />
              <Input
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border-0 focus-visible:ring-0 w-full"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Processing">Processing</SelectItem>
                <SelectItem value="Shipped">Shipped</SelectItem>
                <SelectItem value="Delivered">Delivered</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {loading ? (
          <div className="p-8 flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-hello260-green" />
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">
            Failed to load orders. Please try again.
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No orders found. {searchTerm || statusFilter ? "Try different search criteria." : ""}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="hidden sm:table-header-group">
                <tr className="border-b bg-gray-50 text-gray-600">
                  <th className="text-left py-3 px-4">Order ID</th>
                  <th className="text-left py-3 px-4">Customer</th>
                  <th className="text-left py-3 px-4">Date</th>
                  <th className="text-right py-3 px-4">Total</th>
                  <th className="text-center py-3 px-4">Status</th>
                  <th className="text-right py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id || order._id} className="border-b hover:bg-gray-50 block sm:table-row">
                    <td className="py-3 px-4 block sm:table-cell">
                      <div className="flex flex-col sm:flex-row sm:items-center">
                        <div className="font-medium">{order.id || order._id}</div>
                        <div className="text-gray-500 text-sm mt-1 sm:hidden">
                          {order.user?.name || 'N/A'}
                        </div>
                      </div>
                    </td>
                    <td className="hidden sm:table-cell py-3 px-4">
                      {order.user?.name || 'N/A'}
                    </td>
                    <td className="py-2 px-4 sm:py-3 block sm:table-cell">
                      <div className="flex justify-between sm:block">
                        <span className="sm:hidden text-sm text-gray-500">Date:</span>
                        <div className="flex items-center gap-1">
                          <Calendar size={14} className="text-gray-400 sm:hidden" />
                          <span>{formatDate(order.createdAt)}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-2 px-4 sm:py-3 block sm:table-cell sm:text-right">
                      <div className="flex justify-between sm:block">
                        <span className="sm:hidden text-sm text-gray-500">Total:</span>
                        <div className="flex items-center gap-1 sm:justify-end">
                          <CreditCard size={14} className="text-gray-400 sm:hidden" />
                          <span className="font-medium">{formatZMW(order.totalPrice)}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-2 px-4 sm:py-3 block sm:table-cell">
                      <div className="flex justify-between sm:justify-center items-center">
                        <span className="sm:hidden text-sm text-gray-500">Status:</span>
                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeClass(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 block sm:table-cell">
                      <div className="flex justify-end space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewOrder(order)}
                          className="flex-1 sm:flex-none justify-center"
                        >
                          <Eye size={16} className="sm:mr-1" />
                          <span className="ml-1">View</span>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedOrder && (
            <>
              <DialogHeader>
                <DialogTitle>Order Details</DialogTitle>
                <DialogDescription>Order ID: {selectedOrder.id || selectedOrder._id}</DialogDescription>
              </DialogHeader>

              <div className="space-y-6 py-3">
                {/* Customer Information */}
                <div className="space-y-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    <User2 size={16} /> Customer Information
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <div className="text-sm text-gray-500">Name</div>
                      <div className="break-words">{selectedOrder.user?.name || 'N/A'}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Email</div>
                      <div className="break-words">{selectedOrder.user?.email || 'N/A'}</div>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="space-y-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Package size={16} /> Order Items
                  </h3>
                  <div className="space-y-2">
                    {selectedOrder.orderItems.map((item, index) => (
                      <div key={index} className="flex justify-between items-center py-2 border-b last:border-0">
                        <div className="flex items-center gap-3">
                          {item.image && (
                            <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded" />
                          )}
                          <div>
                            <div className="font-medium">{item.name}</div>
                            <div className="text-sm text-gray-500">
                              {item.quantity} x {formatZMW(item.price)}
                            </div>
                          </div>
                        </div>
                        <div className="font-medium">
                          {formatZMW(item.price * item.quantity)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Summary */}
                <div className="space-y-3">
                  <h3 className="font-semibold">Order Summary</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Items Total:</span>
                      <span>{formatZMW(selectedOrder.itemsPrice)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Tax:</span>
                      <span>{formatZMW(selectedOrder.taxPrice)}</span>
                    </div>
                    <div className="flex justify-between font-semibold">
                      <span>Total:</span>
                      <span>{formatZMW(selectedOrder.totalPrice)}</span>
                    </div>
                  </div>
                </div>

                {/* Status Update */}
                <div className="space-y-3">
                  <h3 className="font-semibold">Update Status</h3>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Select
                      value={selectedOrder.status}
                      onValueChange={(value) =>
                        handleUpdateOrderStatus(String(selectedOrder._id || selectedOrder.id), value)
                      }
                      disabled={isUpdating}
                    >
                      <SelectTrigger className="w-full sm:w-[200px]">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Processing">Processing</SelectItem>
                        <SelectItem value="Shipped">Shipped</SelectItem>
                        <SelectItem value="Delivered">Delivered</SelectItem>
                        <SelectItem value="Cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-4">
                <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                  Close
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrdersAdmin; 
