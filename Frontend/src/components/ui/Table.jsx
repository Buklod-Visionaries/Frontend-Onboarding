import { cx } from '../../lib/cx';

/**
 * Horizontal scroll shell, so a wide table scrolls inside its card instead of
 * widening the page. Pages with record-style tables show cards on phones instead.
 */
export function TableScroll({ children }) {
  return (
    <div className="-mx-1 max-w-full overflow-x-auto overscroll-x-contain px-1 scroll-thin">
      {children}
    </div>
  );
}

export function Table({ className, children }) {
  return (
    <TableScroll>
      <table className={cx('w-full border-collapse text-left', className)}>{children}</table>
    </TableScroll>
  );
}

/** `columns` accepts strings or `{ label, align }` objects. */
export function THead({ columns }) {
  return (
    <thead>
      <tr>
        {columns.map((column, i) => {
          const label = typeof column === 'string' ? column : column.label;
          const align = typeof column === 'string' ? '' : column.align;
          return (
            <th
              key={i}
              className={cx(
                'border-b border-ink/25 pb-2 pr-4 font-heading text-micro font-semibold uppercase text-ink/55',
                align === 'right' && 'text-right pr-0'
              )}
            >
              {label}
            </th>
          );
        })}
      </tr>
    </thead>
  );
}

export function TRow({ onClick, children }) {
  return (
    <tr
      className={cx(
        'border-b border-ink/[0.08] transition-colors last:border-0 hover:bg-ink/[0.025]',
        onClick && 'cursor-pointer hover:bg-ink/[0.04]'
      )}
      onClick={onClick}
    >
      {children}
    </tr>
  );
}

export function TCell({ strong, muted, align, className, children }) {
  return (
    <td
      className={cx(
        'py-3 pr-4 text-field align-middle',
        strong && 'font-medium',
        muted && 'text-ink/60',
        align === 'right' && 'pr-0 text-right',
        className
      )}
    >
      {children}
    </td>
  );
}
