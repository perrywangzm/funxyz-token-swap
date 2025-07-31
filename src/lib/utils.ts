import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
/**
 * Format a number with thousands separators.
 *  – |value| ≥ 1  : `precision` = max decimal places (truncated, not rounded)
 *  – |value|  < 1 : `precision` = significant figures (truncated),
 *                   but “0.x ± ε” floats are first nudged to the
 *                   nearest `precision`-place decimal to kill artefacts.
 */
export function formatPrice(value: number, precision: number = 2): string {
  if (!value) return "0";

  const sign = value < 0 ? "-" : "";
  const abs = Math.abs(value);

  /* ── 1. canonical decimal string (expand 1.23e-7 → 0.000000123) ───────── */
  let str = abs.toString();
  if (str.includes("e")) {
    const [m, e] = str.split("e");
    const exp = +e;
    const digits = m.replace(".", "");
    if (exp < 0) {
      str = `0.${"0".repeat(-exp - 1)}${digits}`;
    } else {
      const pad = Math.max(exp - (m.split(".")[1]?.length || 0), 0);
      str = digits + "0".repeat(pad);
    }
  }

  /* ── 2. numbers ≥ 1  (simple truncation) ──────────────────────────────── */
  if (abs >= 1) {
    const [intPart, decPart = ""] = str.split(".");
    if (precision === 0) return sign + Number(intPart).toLocaleString("en-US");

    const cropped = decPart.slice(0, precision).replace(/0+$/, "");
    const intWithCommas = Number(intPart).toLocaleString("en-US");
    return sign + (cropped ? `${intWithCommas}.${cropped}` : intWithCommas);
  }

  /* ── 3. numbers < 1  ──────────────────────────────────────────────────── */
  if (precision === 0) return sign + "0";

  /* 3a. kill classic FP artefacts like 0.19999999999999998 */
  if (abs >= 0.01) {
    // only 0.x…; skip tiny values
    const rounded = Number(abs.toFixed(precision));
    const epsilon = 10 ** -(precision + 5); // ≈ 1e-(precision+5)
    if (Math.abs(rounded - abs) < epsilon) {
      return sign + rounded.toString().replace(/\.?0+$/, "");
    }
  }

  /* 3b. significant-figures truncation */
  const decimals = str.split(".")[1] ?? "";
  const firstNonZero = decimals.search(/[1-9]/);
  if (firstNonZero === -1) return sign + "0";

  const sigDigits = decimals.slice(firstNonZero, firstNonZero + precision);
  const out = `0.${"0".repeat(firstNonZero)}${sigDigits}`.replace(/\.?0+$/, "");
  return sign + out;
}

/**
 * Formats a number with comma separators for thousands and proper significant figures
 * @param value - The number to format
 * @param precision - Number of decimal places for large numbers, or significant figures for small numbers (default: 2)
 * @returns Formatted string with comma separators
 */
export function formatPrice2(value: number, precision: number = 2): string {
  if (!value) return "0";

  // Handle negative numbers
  const isNegative = value < 0;
  const absValue = Math.abs(value);

  // Convert to string to check for scientific notation first
  const str = absValue.toString();

  // Handle scientific notation (e.g., 1.2345e-7) - this can represent numbers < 1
  if (str.includes("e")) {
    const [base, exponent] = str.split("e");
    const exp = parseInt(exponent);
    const baseNum = parseFloat(base);

    // If exponent is negative, this represents a number < 1
    if (exp < 0) {
      // Handle precision of 0 for small numbers
      if (precision === 0) {
        return (isNegative ? "-" : "") + "0";
      }

      // Convert scientific notation to decimal string
      // For 1.2345e-7, we want 0.00000012345
      // The number of leading zeros is |exponent| - 1 (because base has one digit before decimal)
      const leadingZeros = Math.abs(exp) - 1;
      const baseStr = baseNum.toString();
      const baseIntegerPart = baseStr.split(".")[0];
      const baseDecimalPart = baseStr.split(".")[1] || "";

      // Create the full decimal representation
      // For 1.2345e-7: leadingZeros=6, baseIntegerPart=1, baseDecimalPart=2345
      // Result: 000000 + 1 + 2345 = 00000012345
      const fullDecimalPart =
        "0".repeat(leadingZeros) + baseIntegerPart + baseDecimalPart;

      // For significant figures, we need to count from the first non-zero digit
      // Find the first non-zero digit position
      const firstNonZeroIndex = fullDecimalPart.search(/[1-9]/);
      if (firstNonZeroIndex === -1) {
        // All zeros
        return (isNegative ? "-" : "") + "0";
      }

      // Take the required number of significant digits starting from the first non-zero
      const significantDigits = fullDecimalPart.substring(
        firstNonZeroIndex,
        firstNonZeroIndex + precision
      );
      const result = `0.${"0".repeat(firstNonZeroIndex)}${significantDigits}`;

      return (isNegative ? "-" : "") + result;
    }
  }

  // If the number is less than 1, treat precision as significant figures
  if (absValue < 1) {
    // Handle precision of 0 for small numbers
    if (precision === 0) {
      return (isNegative ? "-" : "") + "0";
    }

    // Handle floating point precision issues by using toFixed for small numbers
    // This handles cases like 0.3 - 0.1 = 0.19999999999999998
    const roundedValue = parseFloat(absValue.toFixed(precision));
    if (roundedValue !== absValue) {
      return (isNegative ? "-" : "") + roundedValue.toString();
    }

    // Handle regular decimal notation
    const match = str.match(/^0\.0*/);
    if (match) {
      const leadingZeros = match[0].length - 2; // -2 for "0."
      const significantDigits = precision;
      const totalDecimalPlaces = leadingZeros + significantDigits;

      // Use string manipulation to avoid rounding issues
      const fullStr = absValue.toString();
      const decimalIndex = fullStr.indexOf(".");
      if (decimalIndex !== -1) {
        const decimalPart = fullStr.substring(decimalIndex + 1);
        const truncatedDecimal = decimalPart.substring(0, totalDecimalPlaces);
        const result = `0.${truncatedDecimal}`;
        const trimmed = result.replace(/\.?0+$/, "");
        return (isNegative ? "-" : "") + trimmed;
      }
    }
  }

  // For numbers >= 1, preserve all digits before decimal and apply precision to decimal part
  const decimalIndex = str.indexOf(".");

  if (decimalIndex === -1) {
    // No decimal part, just add comma separators
    return (isNegative ? "-" : "") + absValue.toLocaleString("en-US");
  }

  // Split into integer and decimal parts
  const integerPart = str.substring(0, decimalIndex);
  const decimalPart = str.substring(decimalIndex + 1);

  // Handle precision of 0 for large numbers
  if (precision === 0) {
    const formattedIntegerPart = parseInt(integerPart).toLocaleString("en-US");
    return (isNegative ? "-" : "") + formattedIntegerPart;
  }

  // Keep all digits in integer part, limit decimal part to precision using string truncation
  const limitedDecimalPart = decimalPart.substring(0, precision);

  // Remove trailing zeros from decimal part
  const trimmedDecimalPart = limitedDecimalPart.replace(/0+$/, "");

  // Format integer part with comma separators
  const formattedIntegerPart = parseInt(integerPart).toLocaleString("en-US");

  // Combine parts
  const result = trimmedDecimalPart
    ? `${formattedIntegerPart}.${trimmedDecimalPart}`
    : formattedIntegerPart;

  return (isNegative ? "-" : "") + result;
}
