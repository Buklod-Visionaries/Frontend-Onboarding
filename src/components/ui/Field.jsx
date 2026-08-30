import { cx } from '../../lib/cx';

const CONTROL =
  'w-full min-h-9 rounded-control border border-divider bg-surface px-2.5 py-[6px] ' +
  'text-field text-ink caret-accent hover:border-ink/45 focus:border-accent focus:outline-none ' +
  'read-only:opacity-70 disabled:opacity-45';

/** Label + control + optional hint. Wraps any control below. */
export function Field({ label, hint, className, children }) {
  return (
    <label className={cx('flex flex-col gap-[5px]', className)}>
      {label && <span className="text-meta text-ink/70">{label}</span>}
      {children}
      {hint && <span className="text-meta text-ink/50">{hint}</span>}
    </label>
  );
}

export function Input({ className, ...rest }) {
  return <input {...rest} className={cx(CONTROL, className)} />;
}

export function Textarea({ className, ...rest }) {
  return <textarea {...rest} className={cx(CONTROL, 'min-h-[90px] resize-y', className)} />;
}

/** `options` accepts strings or `{ value, label }` objects; children win if given. */
export function Select({ className, options, children, ...rest }) {
  return (
    <select {...rest} className={cx(CONTROL, className)}>
      {options
        ? options.map((option) => {
            const value = typeof option === 'string' ? option : option.value;
            const label = typeof option === 'string' ? option : option.label;
            return (
              <option key={value} value={value}>
                {label}
              </option>
            );
          })
        : children}
    </select>
  );
}

/** Radio row used by the login role picker and Create User. */
export function Radio({ name, checked, onChange, children }) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 text-field">
      <input type="radio" name={name} checked={checked} onChange={onChange} className="peer sr-only" />
      <span
        className={cx(
          'flex h-4 w-4 shrink-0 items-center justify-center rounded-full border',
          checked ? 'border-accent bg-accent' : 'border-ink/40 bg-surface'
        )}
      >
        {checked && <span className="h-1.5 w-1.5 rounded-full bg-bg" />}
      </span>
      <span>{children}</span>
    </label>
  );
}

/** Segmented control — tabs, filters and the demo role switcher. */
export function Segmented({ value, onChange, options, className }) {
  return (
    <div className={cx('inline-flex flex-wrap rounded-control border border-divider p-[2px]', className)}>
      {options.map((option) => {
        const optionValue = typeof option === 'string' ? option : option.value;
        const label = typeof option === 'string' ? option : option.label;
        const active = value === optionValue;
        return (
          <button
            key={optionValue}
            type="button"
            onClick={() => onChange(optionValue)}
            className={cx(
              'rounded-[2px] px-3 py-[5px] font-heading text-field transition-colors',
              active ? 'bg-accent text-bg' : 'text-ink/70 hover:bg-ink/[0.06]'
            )}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
