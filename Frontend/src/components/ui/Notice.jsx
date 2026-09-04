import { cx } from '../../lib/cx';

/** Accent-tinted inline notice (resubmission reason, auto-assignment note). */
export default function Notice({ title, className, children }) {
  return (
    <div
      className={cx(
        'border border-accent bg-accent-100 px-3.5 py-3 text-cell leading-relaxed text-accent-800',
        className
      )}
    >
      {title && <div className="mb-1 text-micro uppercase">{title}</div>}
      {children}
    </div>
  );
}

export function EmptyState({ children }) {
  return (
    <div className="border border-dashed border-divider px-6 py-8 text-center text-field text-ink/50">
      {children}
    </div>
  );
}

/** Numbered step heading used by multi-section forms. */
export function SectionHeading({ step, children }) {
  return (
    <div className="flex items-baseline gap-2.5 border-b border-divider pb-2">
      {step && <span className="font-heading text-cell text-accent-700">{step}</span>}
      <h4 className="text-[20px]">{children}</h4>
    </div>
  );
}
