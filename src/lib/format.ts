/** "৳1,500" — Bangladeshi Taka, no decimals for whole amounts. */
export function formatTaka(amount: number): string {
  const formatted = new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: Number.isInteger(amount) ? 0 : 2,
  }).format(amount);
  return `৳${formatted}`;
}

/** "18:30" → "6:30 PM" */
export function formatTime12(hhmm: string): string {
  const [hStr, mStr] = hhmm.split(':');
  const h = Number(hStr);
  const m = Number(mStr);
  if (Number.isNaN(h) || Number.isNaN(m)) return hhmm;
  const period = h >= 12 && h < 24 ? 'PM' : 'AM';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, '0')} ${period}`;
}

/** "18:00", "19:00" → "6:00 PM – 7:00 PM" */
export function formatTimeRange(start: string, end: string): string {
  return `${formatTime12(start)} – ${formatTime12(end)}`;
}

/** "01712345678" → "017 1234 5678" for readability. */
export function formatPhone(phone: string): string {
  if (!/^\d{11}$/.test(phone)) return phone;
  return `${phone.slice(0, 3)} ${phone.slice(3, 7)} ${phone.slice(7)}`;
}

/** Same rule the backend enforces (Zod): Bangladeshi mobile number. */
export const BD_PHONE_REGEX = /^01[3-9]\d{8}$/;
