'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface CardModalProps {
  open: boolean;
  onClose: () => void;
  label?: string;
  /** Tailwind max-width class for the card. */
  maxWidthClass?: string;
  children: React.ReactNode;
}

/**
 * Opens its children in the middle of the screen over a blurred, dimmed
 * backdrop. Click outside or press Escape to close. Page scroll is locked
 * while it is open.
 */
export function CardModal({
  open,
  onClose,
  label,
  maxWidthClass = 'max-w-3xl',
  children,
}: CardModalProps) {
  const [mounted, setMounted] = useState(false);
  const [shown, setShown] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) {
      setShown(false);
      return;
    }

    const raf = requestAnimationFrame(() => setShown(true));
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);

    return () => {
      cancelAnimationFrame(raf);
      document.body.style.overflow = prevOverflow;
      document.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  if (!mounted || !open) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={label}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
    >
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-black/50 backdrop-blur-md transition-opacity duration-200 ease-out ${
          shown ? 'opacity-100' : 'opacity-0'
        }`}
      />

      <div
        className={`relative w-full ${maxWidthClass} max-h-[88vh] overflow-y-auto rounded-xl bg-[#080808] shadow-[inset_0_0_0_1px_#2a2a2a,0_24px_80px_rgba(0,0,0,0.7)] transition-[opacity,transform] duration-200 ease-out ${
          shown ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-2'
        }`}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-3 right-3 z-10 p-1.5 rounded-md bg-[#080808]/90 hover:bg-[#141414] text-[#b8b8b8] hover:text-[#fafafa] transition-colors focus:outline-none focus-visible:shadow-[0_0_0_2px_rgba(250,250,250,0.3)]"
        >
          <X className="w-4 h-4" />
        </button>
        {children}
      </div>
    </div>,
    document.body
  );
}

export default CardModal;