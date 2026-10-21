// import { useEffect } from 'react';
// import { cx } from '../../lib/cx';
// import { createPortal } from "react-dom";

// /** Dialog over a dimmed backdrop, at the top elevation. Esc and backdrop close. */
// export default function Modal({ open, onClose, kicker, title, subtitle, actions, width, children }) {
//   useEffect(() => {
//     if (!open) return undefined;
//     const onKey = (event) => {
//       if (event.key === 'Escape') onClose();
//     };
//     window.addEventListener('keydown', onKey);
//     return () => window.removeEventListener('keydown', onKey);
//   }, [open, onClose]);

//   if (!open) return null;

// //   return (
// //     <div
// //       className="fixed inset-0 z-40 flex items-center justify-center bg-ink/45 p-6"
// //       onClick={onClose}
// //       role="presentation"
// //     >
// //       <div
// //         role="dialog"
// //         aria-modal="true"
// //         onClick={(event) => event.stopPropagation()}
// //         className={cx(
// //           // text-ink is set explicitly: a dialog can be mounted from anywhere,
// //           // including the accent-900 sidebar, and must not inherit its colour.
// //           'flex max-h-[calc(100dvh-2rem)] w-full flex-col gap-4 overflow-hidden border border-divider bg-bg p-[22px] text-ink shadow-lg',
// //           width || 'max-w-[560px]'
// //         )}
// //       >
// //         {(kicker || title) && (
// //           <header className="flex shrink-0 flex-col gap-1">
// //             {kicker && <span className="text-micro uppercase text-accent-700">{kicker}</span>}
// //             {title && <h3 className="break-words text-[22px] sm:text-[26px]">{title}</h3>}
// //             {subtitle && <p className="m-0 text-cell text-ink/55">{subtitle}</p>}
// //           </header>
// //         )}
// //         <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain scroll-thin">
// //   {children}
// // </div>

// // {actions && (
// //   <footer className="flex shrink-0 flex-wrap justify-end gap-2.5">
// //     {actions}
// //   </footer>
// // )}
// //       </div>
// //     </div>
// //   );
// return createPortal(
//   <div
//     className="fixed inset-0 z-[9999] flex items-center justify-center bg-ink/45 p-6"
//     onClick={onClose}
//     role="presentation"
//   >
//     {/* Keep your existing dialog div and all its contents here */}
//   </div>,
//   document.body
// );
// }

import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cx } from "../../lib/cx";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), iframe, [tabindex]:not([tabindex="-1"])';

export default function Modal({
  open,
  onClose,
  kicker,
  title,
  subtitle,
  actions,
  width,
  height,
  // false: a required step — no close button, and Esc / backdrop do nothing.
  dismissible = true,
  children,
}) {
  const dialogRef = useRef(null);
  const titleId = useId();
  const subtitleId = useId();

  useEffect(() => {
    if (!open) return;

    const onKey = (event) => {
      if (event.key === "Escape" && dismissible) onClose();
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, dismissible]);

  // Focus moves into the dialog on open (the first form field, otherwise the
  // dialog itself) and back to whatever opened it on close.
  useEffect(() => {
    if (!open) return;
    const opener = document.activeElement;
    const dialog = dialogRef.current;
    const field = dialog?.querySelector(
      "[data-dialog-body] input:not([disabled]):not([readonly]):not([type=radio]), [data-dialog-body] textarea:not([disabled]), [data-dialog-body] select:not([disabled])",
    );
    (field || dialog)?.focus({ preventScroll: true });
    return () => {
      if (opener instanceof HTMLElement && opener.isConnected) opener.focus({ preventScroll: true });
    };
  }, [open]);

  // Tab and Shift+Tab cycle within the dialog while it is open.
  const trapTab = (event) => {
    if (event.key !== "Tab") return;
    const items = [...dialogRef.current.querySelectorAll(FOCUSABLE)].filter(
      (el) => el.offsetParent !== null,
    );
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    const active = document.activeElement;
    if (event.shiftKey && (active === first || active === dialogRef.current)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  };

  // While open, the page behind can't scroll (e.g. when scrolling a document
  // preview reaches its end). The scrollbar's width is kept as padding so the
  // page doesn't shift sideways. Previous values are restored on close.
  useEffect(() => {
    if (!open) return;
    const { body } = document;
    const prev = { overflow: body.style.overflow, paddingRight: body.style.paddingRight };
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;
    body.style.overflow = "hidden";
    if (scrollbar > 0) body.style.paddingRight = `${scrollbar}px`;
    return () => {
      body.style.overflow = prev.overflow;
      body.style.paddingRight = prev.paddingRight;
    };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center overscroll-contain bg-ink/45 p-3 sm:p-6"
      onClick={dismissible ? onClose : undefined}
      role="presentation"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={subtitle ? subtitleId : undefined}
        tabIndex={-1}
        onKeyDown={trapTab}
        onClick={(event) => event.stopPropagation()}
        style={height ? { height } : undefined}
        className={cx(
          "flex max-h-[calc(100dvh-1.5rem)] w-full min-w-0 flex-col gap-4 overflow-hidden border border-divider bg-bg p-4 text-ink shadow-lg focus:outline-none sm:max-h-[calc(100dvh-2rem)] sm:p-[22px]",
          width || "max-w-[560px]",
        )}
      >
        {(kicker || title) && (
          <header className="flex shrink-0 items-start gap-3">
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              {kicker && (
                <span className="text-micro uppercase text-accent-700">
                  {kicker}
                </span>
              )}
              {title && (
                <h3 id={titleId} className="break-words text-[22px] sm:text-[26px]">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p id={subtitleId} className="m-0 break-words text-cell text-ink/55">
                  {subtitle}
                </p>
              )}
            </div>
            {/* Same as Esc / clicking the backdrop. */}
            {dismissible && (
            <button
              type="button"
              aria-label="Close dialog"
              title="Close"
              onClick={onClose}
              className="-mr-1.5 -mt-1 flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-control text-ink/60 transition-colors hover:bg-ink/[0.07] hover:text-ink max-sm:size-10"
            >
              <X size={18} strokeWidth={1.75} aria-hidden="true" />
            </button>
            )}
          </header>
        )}

        <div data-dialog-body className="min-h-0 flex-1 overflow-y-auto scroll-thin">
          {children}
        </div>

        {actions && (
          // Phones: actions stack full-width, last (primary) on top.
          <footer className="flex shrink-0 flex-col-reverse gap-2 sm:flex-row sm:flex-wrap sm:justify-end sm:gap-2.5 max-sm:[&>*]:w-full">
            {actions}
          </footer>
        )}
      </div>
    </div>,
    document.body,
  );
}
