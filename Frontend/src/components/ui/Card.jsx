import { cx } from '../../lib/cx';

/**
 * Hairline-bordered surface, one step lighter than the page with a subtle shadow.
 * padding: 'sm' (stat cards, 18px) | 'md' (default, 20px) | 'lg' (forms, 22px) | 'none'
 * Each tightens to 16–18px on phones so content keeps its width.
 */
const PAD = { sm: 'p-4 sm:p-[18px]', md: 'p-4 sm:p-5', lg: 'p-[18px] sm:p-[22px]', none: '' };

export default function Card({ padding = 'md', className, children, ...rest }) {
  return (
    <section {...rest} className={cx('flex min-w-0 flex-col border border-divider bg-neutral-100 shadow-sm', PAD[padding], className)}>
      {children}
    </section>
  );
}
