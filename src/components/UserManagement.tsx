import { useState, useEffect } from "react";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Plus,
  Edit,
  Trash2,
} from "lucide-react";
import accountService, { Account } from "../service/accountService";
import toast from "react-hot-toast";
import { EditAccountModal } from "./EditAccountModal";
import DeleteAccountModal from "./DeleteAccountModal";

interface UserManagementProps {
  onClose?: () => void;
}

export function UserManagement({ onClose }: UserManagementProps) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [accountRoleFilter, setAccountRoleFilter] = useState<
    number | undefined
  >(undefined);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(
    null
  );
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedAccountName, setSelectedAccountName] = useState("");

  useEffect(() => {
    loadAccounts();
  }, [pageNumber, pageSize, accountRoleFilter]);

  // Debounce search - auto search when user stops typing
  useEffect(() => {
    const timer = setTimeout(() => {
      setPageNumber(1); // Reset to first page when searching
      loadAccounts();
    }, 500); // Wait 500ms after user stops typing

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const loadAccounts = async () => {
    try {
      setLoading(true);
      const params: any = {
        PageNumber: pageNumber,
        PageSize: pageSize,
      };

      if (searchTerm) {
        params.AccountEmail = searchTerm;
      }

      if (accountRoleFilter !== undefined) {
        params.AccountRole = accountRoleFilter;
      }

      const response = await accountService.getAccounts(params);

      if (response.data) {
        setAccounts(response.data.items);
        setTotalPages(response.data.totalPages);
        setTotalCount(response.data.totalCount);
        setHasNextPage(response.data.hasNextPage);
        setHasPreviousPage(response.data.hasPreviousPage);
      }
    } catch (error) {
      console.error("Error loading accounts:", error);
      toast.error("Failed to load accounts");
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPageNumber(newPage);
    }
  };

  const handleEditAccount = (accountId: number) => {
    setSelectedAccountId(accountId);
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setSelectedAccountId(null);
  };

  const handleAccountUpdated = () => {
    loadAccounts(); // Reload the accounts list
    handleCloseEditModal();
  };

  const handleDeleteAccount = (accountId: number, accountName: string) => {
    setSelectedAccountId(accountId);
    setSelectedAccountName(accountName);
    setShowDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setSelectedAccountId(null);
    setSelectedAccountName("");
  };

  const handleAccountDeleted = () => {
    loadAccounts(); // Reload the accounts list
    handleCloseDeleteModal();
  };

  const getRoleBadge = (role: number) => {
    switch (role) {
      case 0:
        return (
          <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-medium">
            Admin
          </span>
        );
      case 1:
        return (
          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
            Staff
          </span>
        );
      case 2:
        return (
          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
            Lecturer
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full font-medium">
            Unknown
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
          <button className="bg-orange-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-orange-700 transition flex items-center space-x-2">
            <Plus className="h-5 w-5" />
            <span>Add User</span>
          </button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by email..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
          </div>

          {/* Role Filter */}
          <div>
            <select
              value={
                accountRoleFilter === undefined
                  ? ""
                  : accountRoleFilter.toString()
              }
              onChange={(e) =>
                setAccountRoleFilter(
                  e.target.value === "" ? undefined : Number(e.target.value)
                )
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="">All Roles</option>
              <option value="0">Admin</option>
              <option value="1">Staff</option>
              <option value="2">Lecturer</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
            <span className="ml-3 text-gray-600">Loading accounts...</span>
          </div>
        ) : accounts.length === 0 ? (
          <div className="text-center p-12">
            <p className="text-gray-500">No accounts found</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {accounts.map((account) => (
                <tr key={account.accountId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {account.accountId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {account.accountName}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600">
                      {account.accountEmail}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getRoleBadge(account.accountRole)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEditAccount(account.accountId)}
                        className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50 transition"
                        title="Edit account"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() =>
                          handleDeleteAccount(
                            account.accountId,
                            account.accountName
                          )
                        }
                        className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50 transition"
                        title="Delete account"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {!loading && accounts.length > 0 && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-700">Show</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPageNumber(1);
                }}
                className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
              <span className="text-sm text-gray-700">
                of {totalCount} entries
              </span>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => handlePageChange(pageNumber - 1)}
                disabled={!hasPreviousPage}
                className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Previous</span>
              </button>

              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-700">
                  Page {pageNumber} of {totalPages}
                </span>
              </div>

              <button
                onClick={() => handlePageChange(pageNumber + 1)}
                disabled={!hasNextPage}
                className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <span>Next</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Account Modal */}
      {selectedAccountId && (
        <EditAccountModal
          isOpen={showEditModal}
          onClose={handleCloseEditModal}
          onSuccess={handleAccountUpdated}
          accountId={selectedAccountId}
        />
      )}

      {/* Delete Account Modal */}
      {selectedAccountId && (
        <DeleteAccountModal
          isOpen={showDeleteModal}
          onClose={handleCloseDeleteModal}
          onSuccess={handleAccountDeleted}
          accountId={selectedAccountId}
          accountName={selectedAccountName}
        />
      )}
    </div>
  );
}
