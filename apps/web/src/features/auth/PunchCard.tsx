type Mark = 'paid' | 'trial' | 'failed' | 'none';

const m = (kind: Mark, months: number): Mark[] => Array(months).fill(kind);

const months = 'JFMAMJJASOND'.split('');

// A sample year: one row per customer, one hole per monthly renewal.
const rows = [
  { customer: 'Northwind', holes: m('paid', 12) },
  { customer: 'Halden Co', holes: [...m('trial', 2), ...m('paid', 10)] },
  { customer: 'Ostrava', holes: [...m('paid', 7), ...m('none', 5)] },
  {
    customer: 'Mira Labs',
    holes: [...m('paid', 5), ...m('failed', 1), ...m('paid', 6)],
  },
  { customer: 'Kestrel', holes: [...m('none', 8), ...m('trial', 4)] },
  { customer: 'Pinecrest', holes: [...m('paid', 10), ...m('failed', 2)] },
];

const legend: { mark: Mark; label: string }[] = [
  { mark: 'paid', label: 'Paid' },
  { mark: 'trial', label: 'In trial' },
  { mark: 'failed', label: 'Payment failed' },
];

function Hole({ mark, order }: { mark: Mark; order: number }) {
  return (
    <span
      className={`punch-hole punch-hole-${mark}`}
      style={{ animationDelay: `${order * 45}ms` }}
    />
  );
}

export function PunchCard() {
  return (
    <figure className="punch-card m-0 flex h-full flex-col justify-between gap-10 p-8 pl-12 lg:p-12 lg:pl-16">
      <figcaption className="font-display text-4xl leading-none font-extrabold text-paper [font-stretch:125%] lg:text-6xl">
        Every renewal on one card
      </figcaption>
      <div
        role="img"
        aria-label="Sample year of renewals for six customers. Most months are paid, some are in trial, and two customers have failed payments."
        className="grid grid-cols-[auto_repeat(12,minmax(0,1fr))] items-center gap-x-1 gap-y-3 sm:gap-x-2"
      >
        <span />
        {months.map((month, i) => (
          <span key={i} className="text-center text-xs text-paper/70">
            {month}
          </span>
        ))}
        {rows.map((row, r) => (
          <div key={row.customer} className="contents">
            <span className="pr-3 text-sm whitespace-nowrap text-paper">
              {row.customer}
            </span>
            {row.holes.map((mark, c) => (
              <Hole key={c} mark={mark} order={r + c} />
            ))}
          </div>
        ))}
      </div>
      <ul className="m-0 flex list-none flex-wrap gap-x-6 gap-y-2 p-0 text-sm text-paper">
        {legend.map(({ mark, label }) => (
          <li key={mark} className="flex items-center gap-2">
            <span className="w-4">
              <Hole mark={mark} order={0} />
            </span>
            {label}
          </li>
        ))}
      </ul>
    </figure>
  );
}
