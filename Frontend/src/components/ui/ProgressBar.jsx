import { cx } from '../../lib/cx';

/** height: 'sm' (table rows) | 'md' (default) | 'lg' (employee dashboard) */
const H = { sm: 'h-1.5', md: 'h-2', lg: 'h-2.5' };

export default function ProgressBar({ value, height = 'md', className }) {
  return (
    <div className={cx('w-full bg-neutral-200', H[height], className)}>
      <div
        className="h-full bg-accent transition-[width] duration-300"
        style={{ width: `${value}%` }}
      />
    </div>
  );
}
