import { cx } from '../../lib/cx';

/**
 * Hairline-separated stack: the container paints the divider colour and the
 * 1px grid gaps let it show through between opaque rows.
 * Rows must be opaque — use DividerRow, which supplies the surface colour.
 */
export default function DividerList({ className, children }) {
  return (
    <div className={cx('flex flex-col gap-px border border-divider bg-divider', className)}>
      {children}
    </div>
  );
}

/** One row. `as` swaps the element (div by default; button for clickable rows). */
export function DividerRow({ as: Tag = 'div', className, ...rest }) {
  // Matches the Card surface the list usually sits on.
  return <Tag {...rest} className={cx('bg-neutral-100', className)} />;
}
