import { CircleAlert, CircleCheck, Clock, Info } from 'lucide-react';
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
 */
export default function StatCard({ label, value, note, tone = 'neutral', icon }) {
  const t = TONES[tone] || TONES.neutral;
  const Icon = icon || t.Icon;
  return (
    <Card padding="sm" className={cx('gap-2.5 border-l-[3px]', t.bar)}>
      <div className="flex items-start gap-2.5">
        <span
          aria-hidden="true"
          className={cx('flex size-7 shrink-0 items-center justify-center rounded-control', t.icon)}
        >
          <Icon size={15} strokeWidth={1.75} />
        </span>
        <span className="pt-[3px] font-heading text-[16px] font-semibold leading-tight text-ink">
          {label}
        </span>
      </div>
      <span className={cx('font-heading text-[34px] font-semibold leading-none', t.value)}>
        {value}
      </span>
      {note && <span className="text-meta leading-snug text-ink/70">{note}</span>}
    </Card>
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
        return (
          // justify-between keeps values on one baseline when a label wraps.
          <div key={stat.label} className={cx('flex flex-col justify-between border-l-[3px] bg-bg px-4 py-3.5', t.bar)}>
            <div className="flex items-start gap-1.5 text-cell font-medium leading-snug text-ink/80">
              <Icon size={14} strokeWidth={1.75} aria-hidden="true" className={cx('mt-[2px] shrink-0', t.value)} />
              {stat.label}
            </div>
            <div className={cx('mt-1.5 font-heading text-[28px] font-semibold leading-none', t.value)}>
              {stat.value}
            </div>
          </div>
        );
      })}
    </div>
  );
}
