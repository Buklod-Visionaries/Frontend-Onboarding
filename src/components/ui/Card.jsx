import { cx } from '../../lib/cx';

/**
 * Transparent, hairline-bordered card.
 * padding: 'sm' (stat cards, 18px) | 'md' (default, 20px) | 'lg' (forms, 22px) | 'none'
 */
const PAD = { sm: 'p-[18px]', md: 'p-5', lg: 'p-[22px]', none: '' };

export default function Card({ padding = 'md', className, children, ...rest }) {
  return (
    <section {...rest} className={cx('flex flex-col border border-divider', PAD[padding], className)}>
      {children}
    </section>
  );
}
