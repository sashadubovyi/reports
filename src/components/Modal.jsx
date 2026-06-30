import { useEffect } from 'react';
import { LuX } from 'react-icons/lu';

// Locks background scroll while a modal is open so the underlying admin
// list stays exactly where it was when the modal closes (no scroll jump).
export default function Modal({ open, onClose, children }) {
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto relative" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          onClick={onClose}
          aria-label="Закрыть"
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 p-1 z-10"
        >
          <LuX className="w-5 h-5" />
        </button>
        {children}
      </div>
    </div>
  );
}
