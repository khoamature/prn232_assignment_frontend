import { Unlock } from "lucide-react";

interface UnlockConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  categoryName: string;
  loading?: boolean;
}

export function UnlockConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  categoryName,
  loading = false,
}: UnlockConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          {/* Icon */}
          <div className="flex items-center justify-center w-12 h-12 mx-auto bg-green-100 rounded-full mb-4">
            <Unlock className="h-6 w-6 text-green-600" />
          </div>

          {/* Title */}
          <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
            Unlock Category
          </h3>

          {/* Message */}
          <p className="text-gray-600 text-center mb-6">
            Are you sure you want to unlock and activate{" "}
            <span className="font-semibold text-gray-900">
              "{categoryName}"
            </span>
            ? This category will become visible to users.
          </p>

          {/* Buttons */}
          <div className="flex items-center justify-end space-x-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50 flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Unlocking...</span>
                </>
              ) : (
                <>
                  <Unlock className="h-5 w-5" />
                  <span>Unlock</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
