import { extendTailwindMerge } from 'tailwind-merge';
import { cx } from './cx';

// Teach tailwind-merge the custom @theme keys in index.css. Without this it
// reads `text-field` as a colour and drops it when merged with `text-ink`.
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: ['micro', 'kicker', 'meta', 'cell', 'field'],
      radius: ['control'],
      spacing: ['sidebar'],
    },
  },
});

/**
 * shadcn/ui's class helper. Joins with our existing `cx` (in place of clsx),
 * then lets later Tailwind classes override earlier conflicting ones.
 */
export function cn(...args) {
  return twMerge(cx(...args));
}
