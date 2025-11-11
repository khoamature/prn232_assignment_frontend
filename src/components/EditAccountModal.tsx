import { useState, useEffect } from "react";
import { X } from "lucide-react";
import accountService, {
  UpdateAccountAdminRequest,
} from "../service/accountService";
import toast from "react-hot-toast";

interface EditAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  accountId: number;
}

export function EditAccountModal({
  isOpen,
  onClose,
  onSuccess,
  accountId,
}: EditAccountModalProps) {
  const [accountName, setAccountName] = useState("");
  const [accountEmail, setAccountEmail] = useState("");
  const [accountRole, setAccountRole] = useState<string>("Staff");
  const [loading, setLoading] = useState(false);
  const [loadingAccount, setLoadingAccount] = useState(false);

  useEffect(() => {
    if (isOpen && accountId) {
      loadAccountDetails();
    }
  }, [isOpen, accountId]);

  const loadAccountDetails = async () => {
    try {
      setLoadingAccount(true);
      const response = await accountService.getAccountById(accountId);

      if (response.data) {
        setAccountName(response.data.accountName);
        setAccountEmail(response.data.accountEmail);

        // Convert role number to string
        const roleMap: { [key: number]: string } = {
          0: "Admin",
          1: "Staff",
          2: "Lecturer",
        };
        setAccountRole(roleMap[response.data.accountRole] || "Staff");
      }
    } catch (error) {
      console.error("Error loading account details:", error);
      toast.error("Failed to load account details");
    } finally {
      setLoadingAccount(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!accountName.trim()) {
      toast.error("Account name is required");
      return;
    }

    if (!accountEmail.trim()) {
      toast.error("Account email is required");
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(accountEmail)) {
      toast.error("Please enter a valid email address");
      return;
    }

    try {
      setLoading(true);

      const data: UpdateAccountAdminRequest = {
        accountName: accountName.trim(),
        accountEmail: accountEmail.trim(),
        accountRole: accountRole,
      };

      await accountService.updateAccount(accountId, data);

      toast.success("Account updated successfully", {
        icon: null,
        style: {
          background: "oklch(72.3% 0.219 149.579)",
          color: "#fff",
          fontWeight: "600",
        },
      });

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Error updating account:", error);
      toast.error(error.response?.data?.message || "Failed to update account");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Edit Account</h2>
          <button
            onClick={handleClose}
            disabled={loading || loadingAccount}
            className="text-gray-400 hover:text-gray-600 transition disabled:opacity-50"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        {loadingAccount ? (
          <div className="flex items-center justify-center p-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
            <span className="ml-3 text-gray-600">Loading account...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Account Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Account Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                disabled={loading}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="Enter account name"
              />
            </div>

            {/* Account Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Account Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={accountEmail}
                onChange={(e) => setAccountEmail(e.target.value)}
                disabled={loading}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="Enter email address"
              />
            </div>

            {/* Account Role */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Account Role <span className="text-red-500">*</span>
              </label>
              <select
                value={accountRole}
                onChange={(e) => setAccountRole(e.target.value)}
                disabled={loading}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="Admin">Admin</option>
                <option value="Staff">Staff</option>
                <option value="Lecturer">Lecturer</option>
              </select>
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition disabled:opacity-50 flex items-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Updating...</span>
                  </>
                ) : (
                  <span>Update Account</span>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
