/**
 * Formatting helpers for the fee ledger.
 *
 * Money is stored as integer minor units (cents) in `bigint`. Every display
 * path goes through `formatMoney` so columns stay aligned and consistent.
 */

const CURRENCY = "INR";
const LOCALE = "en-IN";

const moneyFormatter = new Intl.NumberFormat(LOCALE, {
  style: "currency",
  currency: CURRENCY,
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Format integer minor units (cents) as a currency string, e.g. 125050n → "₹1,250.50". */
export function formatMoney(minorUnits: bigint | number): string {
  const value =
    typeof minorUnits === "bigint" ? Number(minorUnits) : minorUnits;
  if (!Number.isFinite(value)) return moneyFormatter.format(0);
  return moneyFormatter.format(value / 100);
}

/** Format minor units without the currency symbol, for tight numeric columns. */
export function formatAmount(minorUnits: bigint | number): string {
  const value =
    typeof minorUnits === "bigint" ? Number(minorUnits) : minorUnits;
  if (!Number.isFinite(value)) return "0.00";
  return (value / 100).toLocaleString(LOCALE, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/** Parse a user-typed amount (rupees) into integer minor units (cents). */
export function parseMoneyToMinorUnits(input: string): bigint {
  const cleaned = input.replace(/[^0-9.-]/g, "");
  const parsed = Number.parseFloat(cleaned);
  if (!Number.isFinite(parsed)) return 0n;
  return BigInt(Math.round(parsed * 100));
}

/** Convert integer minor units back to a plain editable rupee string. */
export function minorUnitsToInput(minorUnits: bigint | number): string {
  const value =
    typeof minorUnits === "bigint" ? Number(minorUnits) : minorUnits;
  if (!Number.isFinite(value)) return "";
  return (value / 100).toFixed(2);
}

/** Keep only digits from a mobile number for storage. */
export function normalizeMobile(input: string): string {
  return input.replace(/[^\d+]/g, "");
}

/** Group a mobile number for display, e.g. "9876543210" → "98765 43210". */
export function formatMobile(mobile: string): string {
  const digits = mobile.replace(/\D/g, "");
  if (digits.length === 10) {
    return `${digits.slice(0, 5)} ${digits.slice(5)}`;
  }
  return mobile;
}

/** True when a mobile number has a plausible length for a phone contact. */
export function isValidMobile(mobile: string): boolean {
  const digits = mobile.replace(/\D/g, "");
  return digits.length >= 7 && digits.length <= 15;
}

/**
 * Parse a route `id` param into a customer id. Returns `undefined` for a
 * missing or non-numeric value so callers can render a not-found state instead
 * of throwing on `BigInt(...)`.
 */
export function parseCustomerId(raw: string | undefined): bigint | undefined {
  if (raw === undefined) return undefined;
  const trimmed = raw.trim();
  if (!/^\d+$/.test(trimmed)) return undefined;
  try {
    return BigInt(trimmed);
  } catch {
    return undefined;
  }
}

/** Initials for an avatar chip, e.g. "Asha Rao" → "AR". */
export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
