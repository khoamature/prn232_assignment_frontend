import { useState, useEffect, useRef } from "react";
import {
  X,
  Search,
  ChevronDown,
  Tag as TagIcon,
  Plus,
  Calendar,
} from "lucide-react";
import newsService, {
  UpdateNewsArticleRequest,
  CategoryDropdownItem,
  NewsArticleDetail,
} from "../service/newsService";
import tagService, { Tag } from "../service/tagService";
import toast from "react-hot-toast";

interface EditNewsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  newsId: number;
}

export default function EditNewsModal({
  isOpen,
  onClose,
  onSuccess,
  newsId,
}: EditNewsModalProps) {
  const [newsTitle, setNewsTitle] = useState("");
  const [headline, setHeadline] = useState("");
  const [newsContent, setNewsContent] = useState("");
  const [newsSource, setNewsSource] = useState("");
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [newsStatus, setNewsStatus] = useState<string>("Active");
  const [selectedTags, setSelectedTags] = useState<
    Array<{ id: number; name: string }>
  >([]);

  const [categories, setCategories] = useState<CategoryDropdownItem[]>([]);
  const [categorySearchTerm, setCategorySearchTerm] = useState("");
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);

  const [tagInput, setTagInput] = useState("");
  const [tagSuggestions, setTagSuggestions] = useState<Tag[]>([]);
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const [showCreateTag, setShowCreateTag] = useState(false);

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingTags, setLoadingTags] = useState(false);

  const [authorName, setAuthorName] = useState("");
  const [createdDate, setCreatedDate] = useState("");

  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  const tagDropdownRef = useRef<HTMLDivElement>(null);
  const tagInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      loadCategories();
      loadNewsData();
    } else {
      resetForm();
    }
  }, [isOpen, newsId]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        categoryDropdownRef.current &&
        !categoryDropdownRef.current.contains(event.target as Node)
      ) {
        setIsCategoryDropdownOpen(false);
      }
      if (
        tagDropdownRef.current &&
        !tagDropdownRef.current.contains(event.target as Node)
      ) {
        setShowTagSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Tag autocomplete with debounce
  useEffect(() => {
    const searchTags = async () => {
      if (tagInput.startsWith("#") && tagInput.length > 1) {
        const searchTerm = tagInput.substring(1); // Remove #

        if (searchTerm.trim()) {
          try {
            setLoadingTags(true);
            const response = await tagService.lookupTags(searchTerm);

            if (response.data && response.data.length > 0) {
              // Filter out already selected tags
              const filteredTags = response.data.filter(
                (tag) =>
                  !selectedTags.some((selected) => selected.id === tag.tagId)
              );
              setTagSuggestions(filteredTags);
              setShowTagSuggestions(true);
              setShowCreateTag(false);
            } else {
              // No tags found - show create option
              setTagSuggestions([]);
              setShowCreateTag(true);
              setShowTagSuggestions(true);
            }
          } catch (error) {
            console.error("Error searching tags:", error);
            setTagSuggestions([]);
            setShowCreateTag(true);
            setShowTagSuggestions(true);
          } finally {
            setLoadingTags(false);
          }
        } else {
          setShowTagSuggestions(false);
          setShowCreateTag(false);
        }
      } else {
        setShowTagSuggestions(false);
        setShowCreateTag(false);
      }
    };

    const timer = setTimeout(searchTags, 300); // Debounce 300ms
    return () => clearTimeout(timer);
  }, [tagInput, selectedTags]);

  const loadNewsData = async () => {
    try {
      setLoadingData(true);
      const response = await newsService.getNewsArticleById(newsId);

      if (response.data) {
        const news = response.data;
        setNewsTitle(news.newsTitle || "");
        setHeadline(news.headline || "");
        setNewsContent(news.newsContent || "");
        setNewsSource(news.newsSource || "");
        setCategoryId(news.category?.categoryId || null);
        setNewsStatus(news.newsStatus === 1 ? "Active" : "Inactive");

        // Set tags
        if (news.tags && news.tags.length > 0) {
          setSelectedTags(
            news.tags.map((tag) => ({
              id: tag.tagId,
              name: tag.tagName,
            }))
          );
        }

        // Set author and created date
        setAuthorName(news.author?.fullName || "Unknown");
        setCreatedDate(news.createdDate || "");
      }
    } catch (error: any) {
      console.error("Error loading news data:", error);
      toast.error(error.response?.data?.message || "Failed to load news data");
      onClose();
    } finally {
      setLoadingData(false);
    }
  };

  const loadCategories = async () => {
    try {
      setLoadingCategories(true);
      const response = await newsService.getCategoriesDropdown(false, false);
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
      result.push({ id: category.id, name: category.name, level });
      if (category.children && category.children.length > 0) {
        result = result.concat(flattenCategories(category.children, level + 1));
      }
    });

    return result;
  };

  const flatCategories = flattenCategories(categories);
  const filteredCategories = flatCategories.filter((category) =>
    category.name.toLowerCase().includes(categorySearchTerm.toLowerCase())
  );
  const selectedCategory = flatCategories.find((cat) => cat.id === categoryId);

  const handleSelectCategory = (id: number) => {
    setCategoryId(id);
    setIsCategoryDropdownOpen(false);
    setCategorySearchTerm("");
  };

  const handleSelectTag = (tag: Tag) => {
    if (!selectedTags.some((t) => t.id === tag.tagId)) {
      setSelectedTags([...selectedTags, { id: tag.tagId, name: tag.tagName }]);
    }
    setTagInput("");
    setShowTagSuggestions(false);
    tagInputRef.current?.focus();
  };

  const handleCreateTag = async () => {
    const tagName = tagInput.startsWith("#")
      ? tagInput.substring(1).trim()
      : tagInput.trim();

    if (!tagName) {
      toast.error("Tag name is required");
      return;
    }

    try {
      setLoadingTags(true);
      const response = await tagService.createTag({
        tagName: tagName,
        note: null,
      });

      if (response.data) {
        const newTagId = parseInt(response.data);
        setSelectedTags([...selectedTags, { id: newTagId, name: tagName }]);
        toast.success(`Tag "${tagName}" created successfully`);
        setTagInput("");
        setShowTagSuggestions(false);
        setShowCreateTag(false);
        tagInputRef.current?.focus();
      }
    } catch (error: any) {
      console.error("Error creating tag:", error);
      toast.error(error.response?.data?.message || "Failed to create tag");
    } finally {
      setLoadingTags(false);
    }
  };

  const handleRemoveTag = (tagId: number) => {
    setSelectedTags(selectedTags.filter((t) => t.id !== tagId));
  };

  const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;

    // Automatically add # if user starts typing without it
    if (value.length === 1 && value !== "#") {
      value = "#" + value;
    }

    // Prevent removing # if it's the only character
    if (value.length === 0 || value === "#" || value.startsWith("#")) {
      setTagInput(value);
    } else {
      // If somehow # is removed, add it back
      setTagInput("#" + value);
    }
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && tagInput === "" && selectedTags.length > 0) {
      // Remove last tag
      handleRemoveTag(selectedTags[selectedTags.length - 1].id);
    }
  };

  const resetForm = () => {
    setNewsTitle("");
    setHeadline("");
    setNewsContent("");
    setNewsSource("");
    setCategoryId(null);
    setNewsStatus("Active");
    setSelectedTags([]);
    setTagInput("");
    setCategorySearchTerm("");
    setIsCategoryDropdownOpen(false);
    setShowTagSuggestions(false);
    setShowCreateTag(false);
    setAuthorName("");
    setCreatedDate("");
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!newsTitle.trim()) {
      toast.error("News title is required");
      return;
    }

    if (!headline.trim()) {
      toast.error("Headline is required");
      return;
    }

    if (!newsContent.trim()) {
      toast.error("News content is required");
      return;
    }

    if (!newsSource.trim()) {
      toast.error("News source is required");
      return;
    }

    if (!categoryId) {
      toast.error("Please select a category");
      return;
    }

    try {
      setLoading(true);

      const requestData: UpdateNewsArticleRequest = {
        newsTitle: newsTitle.trim(),
        headline: headline.trim(),
        newsContent: newsContent.trim(),
        newsSource: newsSource.trim(),
        categoryId: categoryId,
        newsStatus: newsStatus,
        tagIds: selectedTags.map((tag) => tag.id),
      };

      await newsService.updateNewsArticle(newsId, requestData);
      toast.success("News article updated successfully!");
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Error updating news article:", error);
      toast.error(
        error.response?.data?.message || "Failed to update news article"
      );
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
            <span className="text-gray-700 font-medium">
              Loading news data...
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-2xl font-bold text-gray-900">
            Edit News Article
          </h2>
          <button
            onClick={handleClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Category Badge and Status */}
          <div className="flex items-center justify-between">
            <div className="relative" ref={categoryDropdownRef}>
              <button
                type="button"
                onClick={() =>
                  setIsCategoryDropdownOpen(!isCategoryDropdownOpen)
                }
                className="inline-flex items-center px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-sm font-medium hover:bg-orange-200 transition"
                disabled={loading}
              >
                {selectedCategory ? selectedCategory.name : "Select Category"}
                <ChevronDown className="ml-2 h-4 w-4" />
              </button>

              {isCategoryDropdownOpen && (
                <div className="absolute z-50 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg w-80">
                  <div className="p-2 border-b border-gray-200 space-y-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        value={categorySearchTerm}
                        onChange={(e) => setCategorySearchTerm(e.target.value)}
                        placeholder="Search categories..."
                        className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        onClick={(e) => e.stopPropagation()}
                        autoFocus
                      />
                    </div>
                    {categorySearchTerm && (
                      <div className="text-xs text-gray-500 px-1">
                        Found {filteredCategories.length}{" "}
                        {filteredCategories.length === 1
                          ? "category"
                          : "categories"}
                      </div>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto">
                    {filteredCategories.length > 0 ? (
                      filteredCategories.map((category) => (
                        <button
                          key={category.id}
                          type="button"
                          onClick={() => handleSelectCategory(category.id)}
                          className={`w-full px-4 py-2 text-left hover:bg-orange-50 transition ${
                            categoryId === category.id
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
                      <div className="px-4 py-8 text-center">
                        <div className="text-gray-400 mb-2">
                          <Search className="h-8 w-8 mx-auto" />
                        </div>
                        <p className="text-sm text-gray-500 font-medium">
                          No categories found
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Try a different search term
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Status Toggle Switch */}
            <div className="flex items-center space-x-3">
              <span className="text-sm font-medium text-gray-700 cursor-default">
                Status:
              </span>
              <button
                type="button"
                onClick={() =>
                  setNewsStatus(newsStatus === "Active" ? "Inactive" : "Active")
                }
                disabled={loading}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 ${
                  newsStatus === "Active" ? "bg-green-600" : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    newsStatus === "Active" ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
              <span
                className={`text-sm font-medium w-16 cursor-default ${
                  newsStatus === "Active" ? "text-green-600" : "text-yellow-600"
                }`}
              >
                {newsStatus === "Active" ? "Published" : "Draft"}
              </span>
            </div>
          </div>

          {/* Date and Author Info */}
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center space-x-2 cursor-default">
              <Calendar className="h-4 w-4" />
              <span>
                {createdDate
                  ? new Date(createdDate).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "N/A"}
              </span>
            </div>
          </div>

          {/* Title */}
          <div>
            <textarea
              value={newsTitle}
              onChange={(e) => setNewsTitle(e.target.value)}
              className="w-full text-3xl font-bold text-gray-900 border-0 focus:ring-0 focus:outline-none px-0 resize-none overflow-hidden"
              placeholder="Article Title"
              disabled={loading}
              required
              rows={1}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = "auto";
                target.style.height = target.scrollHeight + "px";
              }}
            />
          </div>

          {/* Headline */}
          <div>
            <textarea
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              className="w-full text-xl text-gray-600 border-0 focus:ring-0 focus:outline-none px-0 resize-none overflow-hidden"
              placeholder="Article headline or summary"
              disabled={loading}
              required
              rows={1}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = "auto";
                target.style.height = target.scrollHeight + "px";
              }}
            />
          </div>

          {/* Author and Source */}
          <div className="grid grid-cols-2 gap-4 pb-4 border-b border-gray-200">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                BY
              </label>
              <div className="text-sm font-medium text-gray-900 select-none cursor-default">
                {authorName}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                SOURCE <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={newsSource}
                onChange={(e) => setNewsSource(e.target.value)}
                className="w-full text-sm italic text-gray-600 border-0 focus:ring-0 focus:outline-none px-0"
                placeholder="e.g., Tech News, VNExpress"
                disabled={loading}
                required
              />
            </div>
          </div>

          {/* Tags Section */}
          <div className="space-y-2">
            <label className="block text-xs font-medium text-gray-500">
              TAGS{" "}
              <span className="text-gray-400 font-normal">
                (Type # to add tags)
              </span>
            </label>
            <div className="relative" ref={tagDropdownRef}>
              <div className="flex flex-wrap gap-2 items-center">
                {selectedTags.map((tag) => (
                  <span
                    key={tag.id}
                    className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full border border-gray-300"
                  >
                    #{tag.name}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag.id)}
                      className="ml-2 hover:text-gray-900"
                      disabled={loading}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
                <input
                  ref={tagInputRef}
                  type="text"
                  value={tagInput}
                  onChange={handleTagInputChange}
                  onKeyDown={handleTagInputKeyDown}
                  onFocus={() => {
                    if (tagInput === "") {
                      setTagInput("#");
                    }
                  }}
                  className="flex-1 min-w-[150px] text-sm border-0 focus:ring-0 focus:outline-none px-0"
                  placeholder={
                    selectedTags.length === 0 ? "Type # to add tags..." : ""
                  }
                  disabled={loading}
                />
              </div>

              {/* Tag Suggestions Dropdown */}
              {showTagSuggestions && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {loadingTags ? (
                    <div className="px-4 py-3 text-sm text-gray-500 text-center">
                      Searching tags...
                    </div>
                  ) : tagSuggestions.length > 0 ? (
                    tagSuggestions.map((tag) => (
                      <button
                        key={tag.tagId}
                        type="button"
                        onClick={() => handleSelectTag(tag)}
                        className="w-full px-4 py-2 text-left hover:bg-orange-50 transition text-gray-900 flex items-center space-x-2"
                      >
                        <TagIcon className="h-4 w-4 text-orange-600" />
                        <span>#{tag.tagName}</span>
                      </button>
                    ))
                  ) : showCreateTag ? (
                    <button
                      type="button"
                      onClick={handleCreateTag}
                      disabled={loadingTags}
                      className="w-full px-4 py-2 text-left hover:bg-green-50 transition text-green-700 flex items-center space-x-2 font-medium"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Create tag "{tagInput.substring(1)}"</span>
                    </button>
                  ) : null}
                </div>
              )}
            </div>
          </div>

          {/* News Content */}
          <div className="border-t border-gray-200 pt-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Article Content <span className="text-red-500">*</span>
            </label>
            <textarea
              value={newsContent}
              onChange={(e) => setNewsContent(e.target.value)}
              rows={12}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-700 leading-relaxed"
              placeholder="Write your article content here..."
              disabled={loading}
              required
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
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
              className="px-4 py-2 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Updating...</span>
                </>
              ) : (
                <span>Update Article</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
