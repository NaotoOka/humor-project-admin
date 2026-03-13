"use client";

import { useEffect, useCallback, ReactNode } from "react";
import { createPortal } from "react-dom";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  /** Maximum width class (e.g., "max-w-md", "max-w-lg", "max-w-2xl") */
  maxWidth?: string;
  /** Whether clicking the backdrop closes the modal */
  closeOnBackdropClick?: boolean;
  /** Whether pressing Escape closes the modal */
  closeOnEscape?: boolean;
  /** Custom border color class for the modal */
  borderColor?: string;
}

export function Modal({
  isOpen,
  onClose,
  children,
  maxWidth = "max-w-lg",
  closeOnBackdropClick = true,
  closeOnEscape = true,
  borderColor = "border-border",
}: ModalProps) {
  // Handle escape key
  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" && closeOnEscape) {
        onClose();
      }
    },
    [onClose, closeOnEscape]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleEscape]);

  if (!isOpen || typeof document === "undefined") {
    return null;
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && closeOnBackdropClick) {
      onClose();
    }
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50"
      onClick={handleBackdropClick}
    >
      <div
        className={`w-full ${maxWidth} bg-card-bg rounded-xl shadow-xl border ${borderColor} max-h-[90vh] flex flex-col`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

interface ModalHeaderProps {
  children: ReactNode;
  /** Whether to show a close button */
  showCloseButton?: boolean;
  onClose?: () => void;
  /** Background color class for the header */
  bgColor?: string;
  /** Border color class for the header */
  borderColor?: string;
}

export function ModalHeader({
  children,
  showCloseButton = false,
  onClose,
  bgColor = "",
  borderColor = "border-border",
}: ModalHeaderProps) {
  return (
    <div className={`p-6 border-b ${borderColor} ${bgColor} flex-shrink-0`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">{children}</div>
        {showCloseButton && onClose && (
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <svg
              className="w-5 h-5 text-muted"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

interface ModalContentProps {
  children: ReactNode;
  className?: string;
}

export function ModalContent({ children, className = "" }: ModalContentProps) {
  return (
    <div className={`p-6 overflow-y-auto flex-1 ${className}`}>{children}</div>
  );
}

interface ModalFooterProps {
  children: ReactNode;
  className?: string;
}

export function ModalFooter({ children, className = "" }: ModalFooterProps) {
  return (
    <div className={`p-6 border-t border-border flex-shrink-0 ${className}`}>
      {children}
    </div>
  );
}

interface ModalIconProps {
  /** Icon color class (e.g., "text-red-500", "text-purple-500") */
  color?: string;
  /** Background color class */
  bgColor?: string;
  children: ReactNode;
}

export function ModalIcon({
  color = "text-purple-500",
  bgColor = "bg-purple-500/20",
  children,
}: ModalIconProps) {
  return (
    <div
      className={`flex items-center justify-center w-12 h-12 rounded-full ${bgColor}`}
    >
      <div className={`w-6 h-6 ${color}`}>{children}</div>
    </div>
  );
}

// Common icons for convenience
export const DeleteIcon = () => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
    />
  </svg>
);

// Error display component for modals
interface ModalErrorProps {
  message: string | null;
}

export function ModalError({ message }: ModalErrorProps) {
  if (!message) return null;

  return (
    <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-sm">
      {message}
    </div>
  );
}

// Loading spinner for modal buttons
export function ModalSpinner() {
  return (
    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
  );
}
