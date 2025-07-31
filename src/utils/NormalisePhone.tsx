/**
 * Normalize a user-entered Indian phone number to "91XXXXXXXXXX".
 * Always returns country code "91" + 10-digit subscriber number.
 * Strips all formatting, +, spaces, dashes, parentheses, 00 prefix, etc.
 * Returns null if a clean 10-digit subscriber number cannot be determined.
 */
export function normalizeIndianPhone(input: string): string | null {
  if (!input) return null;

  // Strip all non-digits
  let digits = input.replace(/\D+/g, "");

  // Remove leading 00 (intl prefix) if present (ex: 00917715009983)
  digits = digits.replace(/^00+/, "");

  // If number starts with 91 and length > 12, assume extra noise or double prefix.
  // We'll just use the *last* 10 digits as the subscriber.
  if (digits.startsWith("91") && digits.length > 12) {
    const subscriber10 = digits.slice(-10);
    if (/^\d{10}$/.test(subscriber10)) {
      return `91${subscriber10}`;
    }
  }

  // If exactly 91 + 10 digits → good as-is
  if (/^91\d{10}$/.test(digits)) {
    return digits;
  }

  // If number starts with 0 + 10 digits → drop 0 and prefix 91
  if (/^0\d{10}$/.test(digits)) {
    const subscriber10 = digits.slice(1);
    return `91${subscriber10}`;
  }

  // Generic fallback: take the *last* 10 digits from whatever the user entered
  if (digits.length >= 10) {
    const subscriber10 = digits.slice(-10);
    if (/^\d{10}$/.test(subscriber10)) {
      return `91${subscriber10}`;
    }
  }

  console.warn("normalizeIndianPhone: unable to normalize:", input);
  return null;
}