import { useState, useEffect } from "react";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Plus,
  Edit,
  Trash2,
  AlertTriangle,
  Unlock,
} from "lucide-react";
import categoryService, { Category } from "../service/categoryService";
import toast from "react-hot-toast";
import { CreateCategoryModal } from "./CreateCategoryModal";
import { EditCategoryModal } from "./EditCategoryModal";
import { DeleteConfirmModal } from "./DeleteConfirmModal";
import { UnlockConfirmModal } from "./UnlockConfirmModal";

interface CategoryManagementProps {
  onClose?: () => void;
}

export function CategoryManagement({ onClose }: CategoryManagementProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isActiveFilter, setIsActiveFilter] = useState<boolean | undefined>(
    undefined
  );
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null
  );
  const [categoryToDelete, setCategoryToDelete] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [categoryToUnlock, setCategoryToUnlock] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [unlocking, setUnlocking] = useState(false);

  useEffect(() => {
    loadCategories();
  }, [pageNumber, pageSize, isActiveFilter]);

  // Debounce search - auto search when user stops typing
  useEffect(() => {
    const timer = setTimeout(() => {
      setPageNumber(1); // Reset to first page when searching
      loadCategories();
    }, 500); // Wait 500ms after user stops typing

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const params: any = {
        PageNumber: pageNumber,
        PageSize: pageSize,
      };

      if (searchTerm) {
        params.CategoryName = searchTerm;
      }

      if (isActiveFilter !== undefined) {
        params.IsActive = isActiveFilter;
      }

      const response = await categoryService.getCategories(params);

      if (response.data) {
        setCategories(response.data.items);
        setTotalPages(response.data.totalPages);
        setTotalCount(response.data.totalCount);
        setHasNextPage(response.data.hasNextPage);
        setHasPreviousPage(response.data.hasPreviousPage);
      }
    } catch (error) {
      console.error("Error loading categories:", error);
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPageNumber(newPage);
    }
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
        Active
      </span>
    ) : (
      <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full font-medium">
        Inactive
      </span>
    );
  };

  const handleCreateCategory = () => {
    setShowCreateModal(true);
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
  };

  const handleCategoryCreated = () => {
    loadCategories(); // Reload the categories list
    handleCloseModal();
  };

  const handleEditCategory = (categoryId: number) => {
    setSelectedCategoryId(categoryId);
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setSelectedCategoryId(null);
  };

  const handleCategoryUpdated = () => {
    loadCategories(); // Reload the categories list
    handleCloseEditModal();
  };

  const handleDeleteClick = (categoryId: number, categoryName: string) => {
    setCategoryToDelete({ id: categoryId, name: categoryName });
    setShowDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setCategoryToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return;

    try {
      setDeleting(true);
      const response = await categoryService.deleteCategory(
        categoryToDelete.id
      );

      // Check the message from response
      const message = response?.message || "";

      if (message === "Category deactivated because it has related data") {
        // Show warning toast for deactivation
        toast(message, {
          icon: "⚠️",
          style: {
            background: "#f59e0b", // Orange/amber color for warning
            color: "#fff",
            fontWeight: "600",
          },
        });
      } else {
        // Show success toast for deletion
        toast.success("Category deleted successfully");
      }

      loadCategories(); // Reload the categories list
      handleCloseDeleteModal();
    } catch (error: any) {
      console.error("Error deleting category:", error);

      // Extract message from error response
      const errorMessage =
        error.response?.data?.message || "Failed to delete category";

      toast.error(errorMessage);
    } finally {
      setDeleting(false);
    }
  };

  const handleUnlockClick = (categoryId: number, categoryName: string) => {
    setCategoryToUnlock({ id: categoryId, name: categoryName });
    setShowUnlockModal(true);
  };

  const handleCloseUnlockModal = () => {
    setShowUnlockModal(false);
    setCategoryToUnlock(null);
  };

  const handleConfirmUnlock = async () => {
    if (!categoryToUnlock) return;

    try {
      setUnlocking(true);
      await categoryService.unlockCategory(categoryToUnlock.id);

      toast.success("Category activated successfully");

      loadCategories(); // Reload the categories list
      handleCloseUnlockModal();
    } catch (error: any) {
      console.error("Error unlocking category:", error);

      const errorMessage =
        error.response?.data?.message || "Failed to unlock category";

      toast.error(errorMessage);
    } finally {
      setUnlocking(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">
            Category Management
          </h2>
          <button
            onClick={handleCreateCategory}
            className="bg-orange-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-orange-700 transition flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>New Category</span>
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
                placeholder="Search by category name..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={
                isActiveFilter === undefined ? "" : isActiveFilter.toString()
              }
              onChange={(e) =>
                setIsActiveFilter(
                  e.target.value === "" ? undefined : e.target.value === "true"
                )
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="">All Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
            <span className="ml-3 text-gray-600">Loading categories...</span>
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center p-12">
            <p className="text-gray-500">No categories found</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Parent Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {categories.map((category) => (
                <tr
                  key={category.categoryId}
                  className="hover:bg-gray-50 transition"
                >
                  <td
                    className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 ${
                      !category.isActive ? "opacity-50 blur-[0.5px]" : ""
                    }`}
                  >
                    {category.categoryId}
                  </td>
                  <td
                    className={`px-6 py-4 whitespace-nowrap ${
                      !category.isActive ? "opacity-50 blur-[0.5px]" : ""
                    }`}
                  >
                    <div className="text-sm font-medium text-gray-900">
                      {category.categoryName}
                    </div>
                  </td>
                  <td
                    className={`px-6 py-4 ${
                      !category.isActive ? "opacity-50 blur-[0.5px]" : ""
                    }`}
                  >
                    <div className="text-sm text-gray-600 max-w-xs truncate">
                      {category.categoryDescription}
                    </div>
                  </td>
                  <td
                    className={`px-6 py-4 whitespace-nowrap ${
                      !category.isActive ? "opacity-50 blur-[0.5px]" : ""
                    }`}
                  >
                    {category.parent ? (
                      <div className="text-sm text-gray-600">
                        {category.parent.parentCategoryName}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">Root</span>
                    )}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap`}>
                    {getStatusBadge(category.isActive)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEditCategory(category.categoryId)}
                        className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50 transition"
                        title="Edit category"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      {category.isActive ? (
                        <button
                          onClick={() =>
                            handleDeleteClick(
                              category.categoryId,
                              category.categoryName
                            )
                          }
                          className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50 transition"
                          title="Delete category"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() =>
                            handleUnlockClick(
                              category.categoryId,
                              category.categoryName
                            )
                          }
                          className="text-green-600 hover:text-green-800 p-1 rounded hover:bg-green-50 transition"
                          title="Unlock and activate category"
                        >
                          <Unlock className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {!loading && categories.length > 0 && (
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

      {/* Create Category Modal */}
      <CreateCategoryModal
        isOpen={showCreateModal}
        onClose={handleCloseModal}
        onSuccess={handleCategoryCreated}
      />

      {/* Edit Category Modal */}
      {selectedCategoryId && (
        <EditCategoryModal
          isOpen={showEditModal}
          onClose={handleCloseEditModal}
          onSuccess={handleCategoryUpdated}
          categoryId={selectedCategoryId}
        />
      )}

      {/* Delete Confirm Modal */}
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        title="Delete Category"
        message={
          categoryToDelete
            ? `Are you sure you want to delete "${categoryToDelete.name}"?`
            : ""
        }
        warningMessage="This action cannot be undone."
        loading={deleting}
      />

      {/* Unlock Confirm Modal */}
      <UnlockConfirmModal
        isOpen={showUnlockModal}
        onClose={handleCloseUnlockModal}
        onConfirm={handleConfirmUnlock}
        categoryName={categoryToUnlock?.name || ""}
        loading={unlocking}
      />
    </div>
  );
}
