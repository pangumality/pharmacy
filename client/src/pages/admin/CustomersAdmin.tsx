import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Search, Eye, Mail, Loader2, Calendar, ShoppingBag, CreditCard, User2 } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useUsers } from "@/hooks/useUsers";
import { formatZMW } from "@/utils/currencyUtils";
import { emailApi } from "@/lib/api";

// Define types for our data structures
interface User {
  id?: number | string;
  _id?: string;
  name: string;
  email: string;
  isAdmin: boolean;
  createdAt: string;
  orders?: number;
  totalSpent?: number;
}

interface EmailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedUsers: User[];
  isSending: boolean;
  onSend: (subject: string, message: string) => Promise<void>;
}

const EmailDialog = ({ isOpen, onClose, selectedUsers, isSending, onSend }: EmailDialogProps) => {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const handleSend = async () => {
    if (!subject.trim() || !message.trim()) {
      toast.error("Please fill in both subject and message");
      return;
    }

    await onSend(subject, message);
    setSubject("");
    setMessage("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Send Email</DialogTitle>
          <DialogDescription>
            Sending to {selectedUsers.length} customer{selectedUsers.length !== 1 ? 's' : ''}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <label className="block text-sm font-medium mb-1">Recipients</label>
            <div className="text-sm text-gray-500">
              {selectedUsers.map(user => user.email).join(", ")}
            </div>
          </div>
          
          <div>
            <label htmlFor="subject" className="block text-sm font-medium mb-1">Subject</label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Enter email subject"
              disabled={isSending}
            />
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium mb-1">Message</label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter your message"
              rows={8}
              disabled={isSending}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSending}>
            Cancel
          </Button>
          <Button 
            onClick={handleSend}
            disabled={isSending}
            className="bg-hello260-green hover:bg-hello260-green/90"
          >
            {isSending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Mail className="mr-2 h-4 w-4" />
                Send Email
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const CustomersAdmin = () => {
  const { users, loading, error, getAllUsers } = useUsers();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  useEffect(() => {
    // Load all users on component mount
    getAllUsers();
  }, [getAllUsers]);

  const filteredUsers = users ? users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  const handleUserSelect = (user: User) => {
    setSelectedUsers(prev => {
      const isSelected = prev.some(u => (u.id || u._id) === (user.id || user._id));
      if (isSelected) {
        return prev.filter(u => (u.id || u._id) !== (user.id || user._id));
      } else {
        return [...prev, user];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers);
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

  const handleSendEmail = async (subject: string, message: string) => {
    try {
      setIsSendingEmail(true);
      
      await emailApi.sendBulkEmail({
        recipients: selectedUsers.map(user => user.email),
        subject,
        message
      });

      toast.success(`Email sent to ${selectedUsers.length} customer${selectedUsers.length !== 1 ? 's' : ''}`);
      setIsEmailDialogOpen(false);
      setSelectedUsers([]);
    } catch (error) {
      console.error('Failed to send email:', error);
      toast.error("Failed to send email. Please try again.");
    } finally {
      setIsSendingEmail(false);
    }
  };

  return (
    <div className="px-2 sm:px-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3">
        <h1 className="text-xl sm:text-2xl font-bold">Customers</h1>
        <Button
          onClick={() => setIsEmailDialogOpen(true)}
          disabled={selectedUsers.length === 0}
          className="w-full sm:w-auto bg-hello260-green hover:bg-hello260-green/90 text-white"
        >
          <Mail size={16} className="mr-2" />
          Email Selected ({selectedUsers.length})
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-3 sm:p-4 border-b">
          <div className="flex items-center space-x-2">
            <Search size={20} className="text-gray-400" />
            <Input
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border-0 focus-visible:ring-0"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-8 flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-hello260-green" />
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">
            Failed to load customers. Please try again.
          </div>
        ) : !filteredUsers.length ? (
          <div className="p-8 text-center text-gray-500">
            No customers found. {searchTerm ? "Try a different search term." : ""}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="hidden sm:table-header-group">
                <tr className="border-b bg-gray-50 text-gray-600">
                  <th className="text-left py-3 px-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedUsers.length === filteredUsers.length}
                        onChange={handleSelectAll}
                        className="rounded border-gray-300"
                      />
                    </div>
                  </th>
                  <th className="text-left py-3 px-4">Customer</th>
                  <th className="text-left py-3 px-4">Email</th>
                  <th className="text-left py-3 px-4">Joined</th>
                  <th className="text-center py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id || user._id} className="border-b hover:bg-gray-50 block sm:table-row">
                    <td className="py-3 px-4 block sm:table-cell">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedUsers.some(u => (u.id || u._id) === (user.id || user._id))}
                          onChange={() => handleUserSelect(user)}
                          className="rounded border-gray-300"
                        />
                      </div>
                    </td>
                    <td className="py-3 px-4 block sm:table-cell">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                          <User2 size={16} className="text-gray-500" />
                        </div>
                        <span className="font-medium">{user.name}</span>
                      </div>
                    </td>
                    <td className="py-2 px-4 sm:py-3 block sm:table-cell">
                      <div className="flex justify-between sm:block">
                        <span className="sm:hidden text-sm text-gray-500">Email:</span>
                        <span className="text-gray-600">{user.email}</span>
                      </div>
                    </td>
                    <td className="py-2 px-4 sm:py-3 block sm:table-cell">
                      <div className="flex justify-between sm:block">
                        <span className="sm:hidden text-sm text-gray-500">Joined:</span>
                        <span className="text-gray-600">{formatDate(user.createdAt)}</span>
                      </div>
                    </td>
                    <td className="py-2 px-4 sm:py-3 block sm:table-cell">
                      <div className="flex justify-between sm:justify-center">
                        <span className="sm:hidden text-sm text-gray-500">Status:</span>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          user.isAdmin 
                            ? 'bg-purple-100 text-purple-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {user.isAdmin ? 'Admin' : 'Customer'}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <EmailDialog
        isOpen={isEmailDialogOpen}
        onClose={() => setIsEmailDialogOpen(false)}
        selectedUsers={selectedUsers}
        isSending={isSendingEmail}
        onSend={handleSendEmail}
      />
    </div>
  );
};

export default CustomersAdmin;
