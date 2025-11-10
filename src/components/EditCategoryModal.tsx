import { useState, useEffect, useRef } from "react";
import { X, Search, ChevronDown } from "lucide-react";
import categoryService, {
  CategoryDropdownItem,
  CreateCategoryRequest,
} from "../service/categoryService";
import toast from "react-hot-toast";

interface EditCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  categoryId: number;
}

export function EditCategoryModal({
  isOpen,
  onClose,
  onSuccess,
  categoryId,
}: EditCategoryModalProps) {
  const [categoryName, setCategoryName] = useState("");
  const [categoryDescription, setCategoryDescription] = useState("");
  const [parentCategoryId, setParentCategoryId] = useState<number | undefined>(
    undefined
  );
  const [isActive, setIsActive] = useState(true);
  const [categories, setCategories] = useState<CategoryDropdownItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingCategory, setLoadingCategory] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && categoryId) {
      loadCategoryDetails();
      loadCategories();
    }
  }, [isOpen, categoryId]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const loadCategoryDetails = async () => {
    try {
      setLoadingCategory(true);
      const response = await categoryService.getCategoryById(categoryId);

      if (response.data) {
        setCategoryName(response.data.categoryName);
        setCategoryDescription(response.data.categoryDescription);
        setIsActive(response.data.isActive);

        // Set parent category ID if it exists
        if (response.data.parent) {
          setParentCategoryId(response.data.parent.parentCategoryId);
        } else {
          setParentCategoryId(undefined);
        }
      }
    } catch (error) {
      console.error("Error loading category details:", error);
      toast.error("Failed to load category details");
    } finally {
      setLoadingCategory(false);
    }
  };

  const loadCategories = async () => {
    try {
      setLoadingCategories(true);
      const response = await categoryService.getCategoriesDropdown(
        false,
        false
      );
      if (response.data) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error("Error loading categories:", error);
      toast.error("Failed to load categories");
    } finally {
      setLoadingCategories(false);
    }
  };

  const flattenCategories = (
    categories: CategoryDropdownItem[],
    level: number = 0
  ): Array<{ id: number; name: string; level: number }> => {
    let result: Array<{ id: number; name: string; level: number }> = [];

    categories.forEach((category) => {
      // Exclude current category from parent options
      if (category.id !== categoryId) {
        result.push({ id: category.id, name: category.name, level });
        if (category.children && category.children.length > 0) {
          result = result.concat(
            flattenCategories(category.children, level + 1)
          );
        }
      }
    });

    return result;
  };

  const flatCategories = flattenCategories(categories);

  // Filter categories based on search term
  const filteredCategories = flatCategories.filter((category) =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedCategory = flatCategories.find(
    (cat) => cat.id === parentCategoryId
  );

  const handleSelectCategory = (id: number | undefined) => {
    setParentCategoryId(id);
    setIsDropdownOpen(false);
    setSearchTerm("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!categoryName.trim()) {
      toast.error("Category name is required");
      return;
    }

    try {
      setLoading(true);

      const data: CreateCategoryRequest = {
        categoryName: categoryName.trim(),
        categoryDescription: categoryDescription.trim(),
        isActive,
      };

      // Only include parentCategoryId if it's selected
      if (parentCategoryId !== undefined && parentCategoryId > 0) {
        data.parentCategoryId = parentCategoryId;
      }

      await categoryService.updateCategory(categoryId, data);

      toast.success("Category updated successfully", {
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
      console.error("Error updating category:", error);
      toast.error(error.response?.data?.message || "Failed to update category");
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
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Edit Category</h2>
          <button
            onClick={handleClose}
            disabled={loading || loadingCategory}
            className="text-gray-400 hover:text-gray-600 transition disabled:opacity-50"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        {loadingCategory ? (
          <div className="p-6 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
            <span className="ml-3 text-gray-600">Loading category...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-6 pb-8">
            {/* Category Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="Enter category name"
                required
                disabled={loading}
              />
            </div>

            {/* Category Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                value={categoryDescription}
                onChange={(e) => setCategoryDescription(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="Enter category description"
                required
                disabled={loading}
              />
            </div>

            {/* Parent Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Parent Category
              </label>
              {loadingCategories ? (
                <div className="text-sm text-gray-500">
                  Loading categories...
                </div>
              ) : (
                <div className="relative" ref={dropdownRef}>
                  {/* Selected value display */}
                  <button
                    type="button"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    disabled={loading}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-left flex items-center justify-between bg-white disabled:bg-gray-100"
                  >
                    <span className="text-gray-900">
                      {selectedCategory
                        ? `${"—".repeat(selectedCategory.level)} ${
                            selectedCategory.name
                          }`
                        : "Root Category (No Parent)"}
                    </span>
                    <ChevronDown
                      className={`h-5 w-5 text-gray-400 transition-transform ${
                        isDropdownOpen ? "transform rotate-180" : ""
                      }`}
                    />
                  </button>

                  {/* Dropdown menu */}
                  {isDropdownOpen && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
                      {/* Search input */}
                      <div className="p-2 border-b border-gray-200">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search categories..."
                            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                      </div>

                      {/* Options list */}
                      <div className="max-h-60 overflow-y-auto">
                        {/* Root category option */}
                        <button
                          type="button"
                          onClick={() => handleSelectCategory(undefined)}
                          className={`w-full px-4 py-2 text-left hover:bg-orange-50 transition ${
                            !parentCategoryId
                              ? "bg-orange-100 text-orange-700 font-medium"
                              : "text-gray-900"
                          }`}
                        >
                          Root Category (No Parent)
                        </button>

                        {/* Category options */}
                        {filteredCategories.length > 0 ? (
                          filteredCategories.map((category) => (
                            <button
                              key={category.id}
                              type="button"
                              onClick={() => handleSelectCategory(category.id)}
                              className={`w-full px-4 py-2 text-left hover:bg-orange-50 transition ${
                                parentCategoryId === category.id
                                  ? "bg-orange-100 text-orange-700 font-medium"
                                  : "text-gray-900"
                              }`}
                            >
                              <span>
                                {"—".repeat(category.level)} {category.name}
                              </span>
                            </button>
                          ))
                        ) : (
                          <div className="px-4 py-3 text-sm text-gray-500 text-center">
                            No categories found
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Spacer to push content down when dropdown is open */}
                  {isDropdownOpen && <div className="h-72"></div>}
                </div>
              )}
              <p className="mt-5 text-sm text-gray-500">
                Leave as "Root Category" to create a top-level category
              </p>
            </div>

            {/* Is Active */}
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Status
                </label>
                <p className="text-sm text-gray-500 mt-1">
                  {isActive
                    ? "Category will be visible immediately"
                    : "Category will be hidden from users"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsActive(!isActive)}
                disabled={loading}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                  isActive ? "bg-orange-600" : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isActive ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
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
                  <span>Update Category</span>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
