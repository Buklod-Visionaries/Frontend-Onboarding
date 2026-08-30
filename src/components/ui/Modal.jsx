import { useEffect } from 'react';
import { cx } from '../../lib/cx';

/** Dialog over a dimmed backdrop, at the top elevation. Esc and backdrop close. */
export default function Modal({ open, onClose, kicker, title, subtitle, actions, width, children }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-ink/45 p-6"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        onClick={(event) => event.stopPropagation()}
        className={cx(
          'flex max-h-full w-full flex-col gap-4 overflow-y-auto border border-divider bg-bg p-[22px] shadow-lg scroll-thin',
          width || 'max-w-[560px]'
        )}
      >
        {(kicker || title) && (
          <header className="flex flex-col gap-1">
            {kicker && <span className="text-micro uppercase text-accent-700">{kicker}</span>}
            {title && <h3 className="text-[26px]">{title}</h3>}
            {subtitle && <p className="m-0 text-cell text-ink/55">{subtitle}</p>}
          </header>
        )}
        {children}
        {actions && <footer className="flex flex-wrap justify-end gap-2.5">{actions}</footer>}
      </div>
    </div>
  );
}
