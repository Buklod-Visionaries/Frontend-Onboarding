import { cx } from '../../lib/cx';

/** Dotted activity / history feed. `round` switches square marks to dots. */
export function EventList({ items, round }) {
  return (
    <ul className="m-0 flex list-none flex-col gap-3.5 p-0">
      {items.map((event, i) => (
        <li key={i} className="grid gap-3" style={{ gridTemplateColumns: '8px 1fr' }}>
          <span className={cx('mt-1.5 h-[7px] w-[7px] bg-accent', round && 'rounded-full')} />
          <div>
            <div className="text-field">{event.text}</div>
            <div className="text-[11px] text-ink/45">{event.time}</div>
          </div>
        </li>
      ))}
    </ul>
  );
}
