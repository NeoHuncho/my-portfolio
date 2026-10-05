import { type ReactNode, useEffect, useRef } from 'react';
import { FiX } from 'react-icons/fi';
import { cx } from '@lib/cx';

type DialogProps = {
  labelledBy: string;
  closeLabel: string;
  onClose: () => void;
  /** Side panel on desktop (ticket details) or a centred modal (decisions). */
  variant: 'side' | 'center';
  children: ReactNode;
  footer?: ReactNode;
  header: ReactNode;
};

/**
 * Modal shell shared by the ticket drawer and the decision dialogs. Keep it
 * outside any `content-visibility` section: that containment would pin the
 * fixed overlay to the section instead of the viewport.
 */
export default function Dialog({
  labelledBy,
  closeLabel,
  onClose,
  variant,
  children,
  footer,
  header,
}: DialogProps) {
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const first = panel.current?.querySelector<HTMLElement>(
      '[data-autofocus], textarea, input, button:not([data-close])'
    );
    first?.focus();
    const onKey = (event: KeyboardEvent) => {
      // Only the top-most dialog closes, e.g. a decision opened over the drawer.
      const dialogs = document.querySelectorAll('[role="dialog"]');
      if (event.key === 'Escape' && dialogs[dialogs.length - 1] === panel.current) {
        onClose();
      }
    };
    window.addEventListener('keydown', onKey);
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
      previous?.focus();
    };
  }, [onClose]);

  return (
    <div
      className={cx(
        'fixed inset-0 z-[60] flex items-end',
        variant === 'side'
          ? 'lg:items-stretch lg:justify-end'
          : 'sm:items-center sm:justify-center sm:p-6'
      )}
    >
      <button
        type="button"
        aria-label={closeLabel}
        tabIndex={-1}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        className={cx(
          'animate-fade-up relative flex max-h-[88svh] w-full flex-col overflow-hidden rounded-t-2xl border border-line-strong bg-surface shadow-2xl',
          variant === 'side'
            ? 'lg:max-h-none lg:w-[580px] lg:rounded-none lg:rounded-l-2xl'
            : 'sm:max-w-lg sm:rounded-2xl'
        )}
      >
        <header className="flex items-start gap-3 border-b border-line p-5">
          <div className="min-w-0 flex-1">{header}</div>
          <button
            type="button"
            data-close
            onClick={onClose}
            aria-label={closeLabel}
            className="grid size-8 shrink-0 place-items-center rounded-full text-muted transition hover:bg-surface-3 hover:text-ink"
          >
            <FiX aria-hidden />
          </button>
        </header>
        <div className="scrollbar-thin flex-1 overflow-y-auto px-5 pb-5">{children}</div>
        {footer && <footer className="border-t border-line bg-surface-2/60 p-4">{footer}</footer>}
      </div>
    </div>
  );
}
