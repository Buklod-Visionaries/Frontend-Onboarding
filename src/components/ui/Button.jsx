import { cx } from '../../lib/cx';

const BASE =
  'inline-flex items-center justify-center gap-2 font-heading font-semibold text-field ' +
  'rounded-control transition-colors disabled:opacity-45 disabled:pointer-events-none ' +
  'px-[12.2px] py-[6.8px] whitespace-nowrap';

const VARIANTS = {
  primary: 'bg-accent text-bg hover:bg-accent-600 active:bg-accent-700 rounded-none!',
  secondary: 'border border-divider text-ink hover:bg-ink/[0.07] active:bg-ink/[0.14]',
  ghost: 'text-accent-700 hover:bg-accent/10 active:bg-accent/20',
  icon: 'border border-divider text-ink hover:bg-ink/[0.07] h-9 w-9 p-0'
};

/** variant: primary | secondary | ghost | icon. Primary keeps the blueprint marks. */
export default function Button({
  variant = 'secondary',
  block,
  className,
  children,
  type = 'button',
  ...rest
}) {
  return (
    <button
      type={type}
      {...rest}
      className={cx(BASE, VARIANTS[variant], block && 'w-full', className)}
    >
      {children}
    </button>
  );
}
