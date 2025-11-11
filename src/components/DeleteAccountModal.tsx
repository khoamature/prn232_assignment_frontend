import { useState } from "react";
import accountService from "../service/accountService";
import toast from "react-hot-toast";
import { DeleteConfirmModal } from "./DeleteConfirmModal";

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  accountId: number;
  accountName: string;
}

export default function DeleteAccountModal({
  isOpen,
  onClose,
  onSuccess,
  accountId,
  accountName,
}: DeleteAccountModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await accountService.deleteAccount(accountId);
      toast.success("Account deleted successfully!");
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Error deleting account:", error);

      // Check if it's a 400 error with message
      if (error.response?.status === 400) {
        const errorMessage =
          error.response?.data?.message || "Cannot delete account";
        toast.error(errorMessage);
      } else {
        toast.error("Failed to delete account");
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <DeleteConfirmModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={handleDelete}
      title="Delete Account"
      message={`Are you sure you want to delete the account ${accountName}?`}
      warningMessage="This action cannot be undone. If this account has created news articles, the deletion will fail."
      loading={isDeleting}
    />
  );
}
