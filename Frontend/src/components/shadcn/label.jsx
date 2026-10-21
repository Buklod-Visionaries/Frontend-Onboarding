import * as LabelPrimitive from '@radix-ui/react-label';
import { cn } from '@/lib/utils';

/** shadcn/ui Label, styled like the label text in ui/Field. */
function Label({ className, ...props }) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(
        'flex select-none items-center gap-2 text-meta text-ink/70 ' +
          'peer-disabled:cursor-not-allowed peer-disabled:opacity-45',
        className
      )}
      {...props}
    />
  );
}

export { Label };
