import { useEffect, useRef, useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { cx } from '../../lib/cx';

/**
 * Fallback for when the async Clipboard API is unavailable or blocked — an
 * unfocused document, a restrictive permissions policy, or a non-secure origin.
 * Deprecated, but still the only thing that works in those cases.
 */
function legacyCopy(value) {
  const field = document.createElement('textarea');
  field.value = value;
  field.setAttribute('readonly', '');
  field.style.position = 'fixed';
  field.style.top = '0';
  field.style.opacity = '0';
  document.body.appendChild(field);
  field.select();

  let copied;
  try {
    copied = document.execCommand('copy');
  } catch {
    copied = false;
  }
  document.body.removeChild(field);
  return copied;
}

/**
 * A readable secret with a copy control beside it.
 *
 * The button swaps to a "Copied" confirmation for a couple of seconds. Copy can
 * still fail outright, so `onError` lets the caller surface that rather than
 * leaving the user with silent nothing.
 */
export default function CopyField({ value, label = 'value', onError, className }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef(0);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const copy = async () => {
    let ok;
    try {
      await navigator.clipboard.writeText(value);
      ok = true;
    } catch {
      ok = legacyCopy(value);
    }

    if (!ok) {
      onError?.();
      return;
    }

    setCopied(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <span className={cx('inline-flex items-center gap-2 whitespace-nowrap', className)}>
      <span className="font-heading text-cell text-ink">{value}</span>
      <button
        type="button"
        onClick={copy}
        aria-label={copied ? `${label} copied` : `Copy ${label}`}
        className={cx(
          'inline-flex items-center gap-1 rounded-control border px-1.5 py-[2px]',
          'font-heading text-[10px] uppercase tracking-[0.1em] transition-colors',
          copied
            ? 'border-accent bg-accent-100 text-accent-700'
            : 'border-divider text-ink/60 hover:bg-ink/[0.07] active:bg-ink/[0.14]'
        )}
      >
        {copied ? <Check size={12} strokeWidth={1.5} /> : <Copy size={12} strokeWidth={1.5} />}
        {copied ? 'Copied' : 'Copy'}
      </button>
    </span>
  );
}
