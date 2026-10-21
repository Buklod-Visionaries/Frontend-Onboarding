import { Link } from 'react-router-dom';
import { ArrowUpRight, CircleAlert, CircleCheck, Clock, Info } from 'lucide-react';
import Card from './Card';
import { cx } from '../../lib/cx';

/**
 * Semantic tones shared by every dashboard figure, so a status reads the same
 * colour everywhere. Pick a tone from what the number actually counts:
 *   success — completed / done      warning — in progress / awaiting action
 *   danger  — overdue / needs attention (callers pass it only when > 0)
 *   info    — informational totals  neutral — inactive / general counts
 *   brand   — terracotta primary emphasis
 * Colour is never the only signal: each tone also carries a default icon.
 */
const TONES = {
  neutral: { bar: 'border-l-neutral-400', icon: 'bg-neutral-200 text-neutral-700', value: 'text-ink', Icon: Info },
  info: { bar: 'border-l-sky-600', icon: 'bg-sky-50 text-sky-800', value: 'text-sky-900', Icon: Info },
  brand: { bar: 'border-l-accent', icon: 'bg-accent-100 text-accent-700', value: 'text-accent-800', Icon: Info },
  success: { bar: 'border-l-emerald-600', icon: 'bg-emerald-50 text-emerald-800', value: 'text-emerald-900', Icon: CircleCheck },
  warning: { bar: 'border-l-amber-500', icon: 'bg-amber-50 text-amber-800', value: 'text-amber-900', Icon: Clock },
  danger: { bar: 'border-l-red-600', icon: 'bg-red-50 text-red-800', value: 'text-red-800', Icon: CircleAlert },
};

/**
 * Dashboard metric. The label leads (what the number means), the figure
 * follows in the tone's colour, then one line of context.
 * `icon` overrides the tone's default lucide icon.
 * `to` makes the whole card a link to the page behind the number.
 */
export default function StatCard({ label, value, note, tone = 'neutral', icon, to }) {
  const t = TONES[tone] || TONES.neutral;
  const Icon = icon || t.Icon;
  const card = (
    // @container: in a narrow card (2-up on phones) the icon stacks above the label.
    <Card
      padding="sm"
      className={cx(
        '@container relative h-full min-w-0 gap-2.5 border-l-[3px]',
        t.bar,
        to && 'transition-[box-shadow,border-color] group-hover:border-ink/30 group-hover:shadow-md motion-reduce:transition-none'
      )}
    >
      {to && (
        <ArrowUpRight
          size={16}
          strokeWidth={1.75}
          aria-hidden="true"
          className="absolute right-3 top-3 text-ink/35 transition-colors group-hover:text-ink/70"
        />
      )}
      {/* pr-5 keeps the label clear of the corner arrow on linked cards. */}
      <div className={cx('flex flex-col items-start gap-2 @[11rem]:flex-row @[11rem]:gap-2.5', to && 'pr-5')}>
        <span
          aria-hidden="true"
          className={cx('flex size-7 shrink-0 items-center justify-center rounded-control', t.icon)}
        >
          <Icon size={15} strokeWidth={1.75} />
        </span>
        <span className="min-w-0 break-words font-heading text-[16px] font-semibold leading-tight text-ink @[11rem]:pt-[3px]">
          {label}
        </span>
      </div>
      {/* mt-auto pins value + note to the bottom, so values align across a row. */}
      <div className="mt-auto flex flex-col gap-2.5">
        <span className={cx('font-heading text-[34px] font-semibold leading-none', t.value)}>
          {value}
        </span>
        {note && <span className="text-meta leading-snug text-ink/70">{note}</span>}
      </div>
    </Card>
  );
  if (!to) return card;
  return (
    <Link to={to} className="group block min-w-0 focus-visible:outline-offset-2">
      {card}
    </Link>
  );
}

/**
 * Compact 1px-divider strip of figures (employee dashboard, report summary).
 * Items take the same optional `tone` as StatCard.
 */
export function StatStrip({ items, min = 150 }) {
  return (
    <div
      className="grid gap-px border border-divider bg-divider"
      style={{ gridTemplateColumns: `repeat(auto-fit, minmax(${min}px, 1fr))` }}
    >
      {items.map((stat) => {
        const t = TONES[stat.tone] || TONES.neutral;
        const Icon = stat.icon || t.Icon;
        // `to` makes a cell a link to the page behind the number.
        const Tag = stat.to ? Link : 'div';
        return (
          // justify-between keeps values on one baseline when a label wraps.
          <Tag
            key={stat.label}
            {...(stat.to ? { to: stat.to } : {})}
            className={cx(
              'flex flex-col justify-between border-l-[3px] bg-neutral-100 px-4 py-3.5',
              t.bar,
              stat.to && 'transition-colors hover:bg-bg focus-visible:-outline-offset-2'
            )}
          >
            <div className="flex items-start gap-1.5 text-cell font-medium leading-snug text-ink/80">
              <Icon size={14} strokeWidth={1.75} aria-hidden="true" className={cx('mt-[2px] shrink-0', t.value)} />
              {stat.label}
            </div>
            <div className={cx('mt-1.5 font-heading text-[28px] font-semibold leading-none', t.value)}>
              {stat.value}
            </div>
          </Tag>
        );
      })}
    </div>
  );
}
