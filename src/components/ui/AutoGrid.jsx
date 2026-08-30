import { cx } from '../../lib/cx';

/**
 * The prototype's responsive column pattern:
 * `repeat(auto-fit, minmax(<min>px, 1fr))`. Columns collapse on their own, so
 * no breakpoint classes are needed.
 */
export default function AutoGrid({ min = 300, gap = 'gap-5', className, style, children }) {
  return (
    <div
      className={cx('grid', gap, className)}
      style={{ gridTemplateColumns: `repeat(auto-fit, minmax(${min}px, 1fr))`, ...style }}
    >
      {children}
    </div>
  );
}
