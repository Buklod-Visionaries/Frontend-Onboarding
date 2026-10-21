import { forwardRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cx } from '../../lib/cx';
import { Input } from './Field';

/**
 * Password `Input` with a show/hide toggle inside its right edge. The toggle
 * is a real type="button" so it never submits the form, and switching type
 * leaves the typed value untouched. A mouse click on the toggle keeps focus in
 * the input, so Enter still submits; keyboard users can still Tab to it.
 */
const PasswordInput = forwardRef(function PasswordInput({ className, disabled, ...rest }, ref) {
  const [visible, setVisible] = useState(false);
  const label = visible ? 'Hide password' : 'Show password';

  return (
    <div className="relative">
      <Input
        {...rest}
        ref={ref}
        type={visible ? 'text' : 'password'}
        disabled={disabled}
        className={cx('pr-10', className)}
      />
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => setVisible((v) => !v)}
        disabled={disabled}
        aria-label={label}
        aria-pressed={visible}
        title={label}
        className="absolute inset-y-0 right-0 flex w-9 items-center justify-center rounded-control text-ink/50 transition-colors hover:text-ink disabled:opacity-45"
      >
        {visible ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
      </button>
    </div>
  );
});

export default PasswordInput;
