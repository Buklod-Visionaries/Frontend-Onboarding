import { cx } from '../../lib/cx';

/** Milestone timeline: square nodes filled when done, hairline connector between. */
export function MilestoneTimeline({ items }) {
  return (
    <ol className="m-0 flex list-none flex-col p-0">
      {items.map((milestone, i) => {
        const last = i === items.length - 1;
        return (
          <li key={milestone.title} className="grid gap-3.5" style={{ gridTemplateColumns: '26px 1fr' }}>
            <div className="flex flex-col items-center">
              <span
                className={cx(
                  'h-3.5 w-3.5 shrink-0 border border-accent',
                  milestone.done ? 'bg-accent' : 'bg-transparent'
                )}
              />
              {!last && <span className="w-px flex-1 bg-divider" />}
            </div>
            <div className={last ? '' : 'pb-5'}>
              <div className="font-heading text-[17px]">{milestone.title}</div>
              <div className="text-meta text-ink/55">{milestone.detail}</div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

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
