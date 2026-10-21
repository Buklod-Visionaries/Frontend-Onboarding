import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/shadcn/button';
import ToastHost from './ToastHost';

/**
 * Shared frame for every signed-out screen: Login, Forgot Password, First
 * Login and the auth placeholder.
 *
 * From md (768px) it is a split screen: the accent-900 brand panel beside a
 * vertically centred form column. The form column needs ~400px and the panel
 * ~320px to hold the headline, so below md the panel is dropped and only a
 * one-line organisation label stays above the card. Headline size and panel
 * padding scale fluidly, so resizing within the split never jumps.
 *
 * The panel's record-stack illustration sits in normal flow under the
 * headline, so the two can never overlap; its height follows the viewport
 * (34vh, 150–300px) and shrinks further rather than push the panel past the
 * screen. It is dropped on screens under 560px tall, and the
 * description under 600px, so the panel never scrolls. The panel is pinned to
 * the viewport height (sticky), so a form taller than the screen scrolls
 * beside it without stretching it.
 */
export default function AuthLayout({ children }) {
  return (
    <div className="flex min-h-dvh flex-col md:grid md:grid-cols-[minmax(0,1.1fr)_minmax(420px,1fr)]">
      <BrandPanel />

      {/* my-auto (not justify-center) centres the card vertically but still
          lets it scroll from the top when the viewport is shorter than it. */}
      <main className="flex flex-1 flex-col items-center px-5 py-10 sm:px-8 sm:py-14 md:px-[clamp(32px,4vw,56px)] md:py-10 [@media(max-height:640px)]:py-5">
        <div className="my-auto flex w-full max-w-[400px] flex-col">
          <div className="mb-5 font-heading text-micro uppercase text-ink/50 md:hidden">
            Premiere Medical and Cardiovascular Laboratory Inc. · HR
          </div>
          {children}
        </div>
      </main>
      <ToastHost />
    </div>
  );
}

function BrandPanel() {
  return (
    <header
      className="@container relative isolate hidden flex-col gap-10 overflow-hidden bg-accent-900 p-(--pad) text-bg md:sticky md:top-0 md:flex md:h-dvh md:self-start"
      style={{ '--pad': 'clamp(32px, 4.5vw, 56px)' }}
    >
      {/* Ruled-record texture, fading out towards the top. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10"
        style={{
          backgroundImage:
            'repeating-linear-gradient(to bottom, transparent 0 27px, rgba(242, 242, 243, 0.045) 27px 28px)',
          maskImage: 'linear-gradient(to bottom, transparent, black 55%)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 55%)',
        }}
      />
      {/* Chart margin rule, the one vertical accent on the panel. */}
      <div
        aria-hidden="true"
        className="absolute inset-y-0 left-[calc(var(--pad)-14px)] -z-10 w-px bg-accent/35"
      />

      <div className="flex flex-col gap-1.5">
        <div className="font-heading text-cell uppercase tracking-[0.22em] opacity-75">
          Premiere Medical and Cardiovascular Laboratory Inc.
        </div>
        <div className="font-heading text-cell uppercase tracking-[0.22em] text-accent-300/70">
          Human Resources Department
        </div>
      </div>

      <div className="my-auto flex max-w-[500px] flex-col gap-5">
        <h1 className="text-[clamp(36px,3.4vw+8px,58px)] leading-[1.02]">
          Employee <span className="text-accent-300">Onboarding</span> Management and Tracking
          System
        </h1>
        <p className="m-0 hidden max-w-[440px] text-base leading-relaxed opacity-70 [@media(min-height:600px)]:block">
          Centralized onboarding records, requirement tracking and verification for new hires
          across Laboratory, Imaging, Cardiovascular and Administration.
        </p>
      </div>

      <RecordStack />
    </header>
  );
}

/**
 * Decorative stack of employee record sheets — a chart line, a checklist and
 * a verification ring. Bleeds off the panel's bottom-right corner.
 */
function RecordStack() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 420 250"
      preserveAspectRatio="xMaxYMax meet"
      className="-mb-(--pad) -mr-(--pad) hidden h-[clamp(150px,34vh,300px)] min-h-0 w-auto max-w-[calc(100%+var(--pad))] self-end @[15rem]:block [@media(max-height:559px)]:hidden!"
    >
      {/* Back sheets */}
      <rect x="150" y="34" width="240" height="260" fill="#5d302c" opacity="0.55" transform="rotate(7 270 164)" />
      <rect x="120" y="44" width="240" height="260" fill="#5d302c" stroke="rgba(242,242,243,0.08)" transform="rotate(-3 240 174)" />

      {/* Front sheet */}
      <g transform="rotate(-1.5 210 180)">
        <rect x="88" y="58" width="252" height="240" fill="#804842" fillOpacity="0.55" stroke="rgba(242,242,243,0.14)" />
        <rect x="88" y="58" width="252" height="4" fill="#a65f59" />
        <rect x="110" y="80" width="64" height="5" fill="#ffdedb" opacity="0.55" />
        <rect x="110" y="93" width="120" height="3" fill="#f2f2f3" opacity="0.18" />

        {/* Chart line */}
        <polyline
          points="110,128 160,128 170,128 178,110 188,146 196,122 202,128 318,128"
          fill="none"
          stroke="#c98279"
          strokeWidth="1.6"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <line x1="110" y1="140" x2="318" y2="140" stroke="#f2f2f3" strokeOpacity="0.1" />

        {/* Checklist */}
        {[0, 1, 2].map((i) => (
          <g key={i} transform={`translate(110 ${160 + i * 24})`}>
            <rect x="0" y="0" width="11" height="11" fill="none" stroke="#ffdedb" strokeOpacity="0.5" />
            {i < 2 && (
              <polyline points="2.5,5.8 4.8,8.2 9,3" fill="none" stroke="#e8a096" strokeWidth="1.6" />
            )}
            <rect x="22" y="4" width={i === 1 ? 92 : 128} height="3" fill="#f2f2f3" opacity="0.2" />
          </g>
        ))}

        {/* Verification ring */}
        <circle cx="292" cy="190" r="22" fill="none" stroke="#e8a096" strokeOpacity="0.55" strokeWidth="1.4" />
        <circle cx="292" cy="190" r="16" fill="none" stroke="#e8a096" strokeOpacity="0.3" strokeDasharray="2 3" />
        <polyline points="284,190 290,196 301,184" fill="none" stroke="#e8a096" strokeOpacity="0.8" strokeWidth="1.8" />
      </g>
    </svg>
  );
}

/**
 * The card every auth page sits in: a folder-style tab carrying the page's
 * kicker, then title, description and the page's own content.
 * `back` adds a "Back to sign in" link above the card.
 */
export function AuthCard({ kicker, title, description, back, children }) {
  return (
    <section className="flex w-full flex-col transition duration-500 ease-out starting:translate-y-1.5 starting:opacity-0 motion-reduce:transition-none">
      {back && (
        <Button asChild variant="ghost" size="sm" className="-ml-2.5 mb-3 self-start">
          <Link to="/login">
            <ArrowLeft aria-hidden="true" />
            Back to sign in
          </Link>
        </Button>
      )}

      {/* The tab overlaps the card's top border by 1px so the two read as one folder. */}
      <div className="relative z-10 -mb-px max-w-full self-start border border-b-0 border-divider border-t-2 border-t-accent bg-neutral-100 px-3.5 pb-2 pt-1.5 font-heading text-kicker uppercase text-accent-700">
        {kicker}
      </div>
      <div className="flex flex-col gap-7.5 border border-divider bg-neutral-100 p-[clamp(20px,5vw,32px)] shadow-sm">
        <div className="flex flex-col gap-1.5">
          <h2 className="text-[30px]">{title}</h2>
          {description && <p className="m-0 text-cell text-ink/60">{description}</p>}
        </div>
        {children}
      </div>
    </section>
  );
}
