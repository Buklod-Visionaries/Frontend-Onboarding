import Card from './Card';

/** Dashboard metric: kicker, big condensed figure, one line of context. */
export default function StatCard({ label, value, note }) {
  return (
    <Card padding="sm" className="gap-1">
      <span className="text-micro uppercase text-accent-700">{label}</span>
      <span className="font-heading text-[40px] leading-none">{value}</span>
      {note && <span className="text-meta text-ink/55">{note}</span>}
    </Card>
  );
}

/** Compact 1px-divider strip of figures (employee dashboard, report summary). */
export function StatStrip({ items, min = 150 }) {
  return (
    <div
      className="grid gap-px border border-divider bg-divider"
      style={{ gridTemplateColumns: `repeat(auto-fit, minmax(${min}px, 1fr))` }}
    >
      {items.map((stat) => (
        <div key={stat.label} className="bg-bg px-4 py-3.5">
          <div className="font-heading text-[28px] leading-none">{stat.value}</div>
          <div className="mt-1 text-micro uppercase text-ink/50">{stat.label}</div>
        </div>
      ))}
    </div>
  );
}
