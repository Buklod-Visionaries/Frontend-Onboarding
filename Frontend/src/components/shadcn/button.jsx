import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/**
 * shadcn/ui Button, restyled to the design system: Barlow Condensed labels,
 * the 4px control radius, square-cornered primary (matching ui/Button), and
 * no focus ring of its own so the global :focus-visible outline applies.
 * `asChild` renders the styling onto a child such as a router <Link>.
 */
const buttonVariants = cva(
  'inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-control ' +
    'font-heading font-semibold text-field transition-colors ' +
    'disabled:pointer-events-none disabled:opacity-45 aria-disabled:pointer-events-none aria-disabled:opacity-45 ' +
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: 'rounded-none bg-accent text-bg hover:bg-accent-600 active:bg-accent-700',
        outline: 'border border-divider text-ink hover:bg-ink/[0.07] active:bg-ink/[0.14]',
        ghost: 'text-accent-700 hover:bg-accent/10 active:bg-accent/20',
        link: 'text-accent-700 underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-9 px-[12.2px]',
        sm: 'h-8 px-2.5',
        lg: 'h-[42px] px-4 text-base',
        icon: 'size-9',
        inline: 'h-auto p-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

function Button({ className, variant, size, asChild = false, ...props }) {
  const Comp = asChild ? Slot : 'button';
  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}

// eslint-disable-next-line react-refresh/only-export-components -- shadcn convention
export { Button, buttonVariants };
