import { useEffect, useRef } from 'react';

export function useDialogFocus(open: boolean, onClose: () => void, step: string) {
  const ref = useRef<HTMLDivElement>(null);
  const close = useRef(onClose);
  useEffect(() => { close.current = onClose; }, [onClose]);

  useEffect(() => {
    const dialog = ref.current;
    if (!open || !dialog) return;
    const previous = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    const focusable = () => Array.from(dialog.querySelectorAll<HTMLElement>(
      'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    )).filter(element => element.getClientRects().length > 0);
    const focusFirst = () => (focusable()[0] ?? dialog).focus();
    const keydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        close.current();
      } else if (event.key === 'Tab') {
        const elements = focusable();
        const first = elements[0];
        const last = elements[elements.length - 1];
        if (!first) { event.preventDefault(); dialog.focus(); }
        else if (event.shiftKey && (document.activeElement === first || document.activeElement === dialog)) {
          event.preventDefault(); last.focus();
        } else if (!event.shiftKey && (document.activeElement === last || document.activeElement === dialog)) {
          event.preventDefault(); first.focus();
        }
      }
    };
    const containFocus = (event: FocusEvent) => {
      if (event.target instanceof Node && !dialog.contains(event.target)) focusFirst();
    };
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', keydown, true);
    document.addEventListener('focusin', containFocus);
    focusFirst();
    return () => {
      document.removeEventListener('keydown', keydown, true);
      document.removeEventListener('focusin', containFocus);
      document.body.style.overflow = previousOverflow;
      if (previous instanceof HTMLElement && previous.isConnected) previous.focus();
    };
  }, [open]);
  useEffect(() => {
    const dialog = ref.current;
    if (open && dialog && !dialog.contains(document.activeElement)) dialog.focus();
  }, [open, step]);
  return ref;
}
