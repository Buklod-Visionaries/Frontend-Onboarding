const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const EM_DASH = "—";

/** The prototype is pinned to a fixed 'today' so the seeded data reads consistently. */
export const TODAY = "2026-08-16";

/** '2026-09-08T15:47:04.696Z' -> 'Sep 8, 2026'. Blank and em-dash values pass through. */
export function formatDate(iso) {
  if (!iso || iso === EM_DASH) return EM_DASH;

  const date = new Date(iso);

  if (Number.isNaN(date.getTime())) return EM_DASH;

  return `${MONTHS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

//
export function formatRelativeDate(iso) {
  if (!iso || iso === EM_DASH) return EM_DASH;

  const date = new Date(iso);

  if (Number.isNaN(date.getTime())) return EM_DASH;

  const now = new Date();

  const today = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );

  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const dateOnly = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );

  const time = date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });

  if (dateOnly.getTime() === today.getTime()) {
    return `Today, ${time}`;
  }

  if (dateOnly.getTime() === yesterday.getTime()) {
    return `Yesterday, ${time}`;
  }

  return `${MONTHS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

/** Offsets an ISO date by whole days and returns an ISO date. */
export function addDays(iso, days) {
  const date = new Date(`${iso}T00:00:00`);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

//check if date is overdue
export function isOverdue(iso) {
  if (!iso || iso === EM_DASH) return false;

  const dueDate = new Date(iso);

  if (Number.isNaN(dueDate.getTime())) return false;

  return dueDate < new Date();
}
