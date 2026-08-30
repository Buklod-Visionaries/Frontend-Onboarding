/** Conditional className joiner. Accepts strings and `{ 'class': boolean }` maps. */
export function cx(...args) {
  const out = [];
  for (const arg of args) {
    if (!arg) continue;
    if (typeof arg === 'string') {
      out.push(arg);
    } else if (typeof arg === 'object') {
      for (const [key, on] of Object.entries(arg)) {
        if (on) out.push(key);
      }
    }
  }
  return out.join(' ');
}
