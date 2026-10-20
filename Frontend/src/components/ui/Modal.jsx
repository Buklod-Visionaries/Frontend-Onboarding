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
// //             {title && <h3 className="text-[26px]">{title}</h3>}
// //             {subtitle && <p className="m-0 text-cell text-ink/55">{subtitle}</p>}
// //           </header>
// //         )}
// //         <div className="min-h-0 flex-1 overflow-y-auto scroll-thin">
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

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { cx } from "../../lib/cx";

export default function Modal({
  open,
  onClose,
  kicker,
  title,
  subtitle,
  actions,
  width,
  height,
  children,
}) {
  useEffect(() => {
    if (!open) return;

    const onKey = (event) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-ink/45 p-6"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        onClick={(event) => event.stopPropagation()}
        style={height ? { height } : undefined}
        className={cx(
          "flex max-h-[calc(100dvh-2rem)] w-full flex-col gap-4 overflow-hidden border border-divider bg-bg p-[22px] text-ink shadow-lg",
          width || "max-w-[560px]",
        )}
      >
        {(kicker || title) && (
          <header className="flex shrink-0 flex-col gap-1">
            {kicker && (
              <span className="text-micro uppercase text-accent-700">
                {kicker}
              </span>
            )}
            {title && <h3 className="text-[26px]">{title}</h3>}
            {subtitle && (
              <p className="m-0 text-cell text-ink/55">{subtitle}</p>
            )}
          </header>
        )}

        <div className="min-h-0 flex-1 overflow-y-auto scroll-thin">
          {children}
        </div>

        {actions && (
          <footer className="flex shrink-0 flex-wrap justify-end gap-2.5">
            {actions}
          </footer>
        )}
      </div>
    </div>,
    document.body,
  );
}
