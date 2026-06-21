import { X } from "lucide-react";

export default function DeleteConfirmationModal({ open, onClose, onConfirm, title = "Confirm Delete", message = "Are you sure you want to delete this item? This action cannot be undone." }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white/90 rounded-2xl border border-gray-200 shadow-xl w-full max-w-md p-6 animate-in zoom-in-95 duration-300">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">{title}</h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 text-gray-500">
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-sm text-gray-600 mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
            Cancel
          </button>
          <button onClick={onConfirm} className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors" style={{ backgroundColor: '#800000' }}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
