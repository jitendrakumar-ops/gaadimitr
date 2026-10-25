import React from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  Loader2,
  Trash2,
  X,
} from "lucide-react";

/**
 * Premium Confirmation Modal for Add, Edit, Delete and status actions
 */
const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Are you sure?",
  description = "This action cannot be undone.",
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "danger", // 'danger' | 'warning' | 'info' | 'success'
  loading = false,
}) => {
  if (!isOpen) return null;

  const getTheme = () => {
    switch (type) {
      case "danger":
        return {
          icon: Trash2,
          iconBg: "bg-red-50 text-red-600 border-red-100",
          buttonBg: "bg-red-600 hover:bg-red-700 text-white shadow-red-200",
        };
      case "warning":
        return {
          icon: AlertTriangle,
          iconBg: "bg-amber-50 text-amber-600 border-amber-100",
          buttonBg: "bg-amber-600 hover:bg-amber-700 text-white shadow-amber-200",
        };
      case "success":
        return {
          icon: CheckCircle2,
          iconBg: "bg-emerald-50 text-emerald-600 border-emerald-100",
          buttonBg: "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200",
        };
      case "info":
      default:
        return {
          icon: Info,
          iconBg: "bg-blue-50 text-[#0757D9] border-blue-100",
          buttonBg: "bg-[#0757D9] hover:bg-blue-700 text-white shadow-blue-200",
        };
    }
  };

  const theme = getTheme();
  const Icon = theme.icon;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md overflow-hidden rounded-2xl border border-slate-100 bg-white p-6 shadow-2xl transition-all"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="absolute right-4 top-4 rounded-xl p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
        >
          <X size={16} />
        </button>

        {/* Modal Content */}
        <div className="flex flex-col items-center text-center">
          <div
            className={`flex h-14 w-14 items-center justify-center rounded-2xl border ${theme.iconBg} mb-4 shadow-sm`}
          >
            <Icon size={26} strokeWidth={2.2} />
          </div>

          <h3 className="text-base font-extrabold text-slate-900">
            {title}
          </h3>

          <p className="mt-2 text-xs font-medium leading-relaxed text-slate-500">
            {description}
          </p>

          {/* Action Buttons */}
          <div className="mt-6 flex w-full items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >
              {cancelText}
            </button>

            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className={`flex-1 inline-flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold shadow-md transition disabled:opacity-50 ${theme.buttonBg}`}
            >
              {loading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <span>{confirmText}</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
