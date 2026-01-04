/**
 * Currency utility functions for INR (Indian Rupees)
 */

export const CURRENCY_SYMBOL = "₹";
export const CURRENCY_CODE = "INR";

/**
 * Format a number as Indian Rupee currency
 * @param amount - The amount to format
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted currency string (e.g., "₹1,234.56")
 */
export function formatCurrency(amount: number | string | null | undefined, decimals: number = 2): string {
  // Handle null, undefined, or empty values
  if (amount === null || amount === undefined || amount === "") {
    return `${CURRENCY_SYMBOL}0.00`;
  }

  // Convert string to number if needed
  const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;

  // Check if conversion resulted in a valid number
  if (isNaN(numAmount)) {
    return `${CURRENCY_SYMBOL}0.00`;
  }

  return `${CURRENCY_SYMBOL}${numAmount.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
}

/**
 * Format a number as Indian Rupee currency without symbol (for display in tables, etc.)
 * @param amount - The amount to format
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted currency string (e.g., "1,234.56")
 */
export function formatCurrencyAmount(amount: number | string | null | undefined, decimals: number = 2): string {
  // Handle null, undefined, or empty values
  if (amount === null || amount === undefined || amount === "") {
    return "0.00";
  }

  // Convert string to number if needed
  const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;

  // Check if conversion resulted in a valid number
  if (isNaN(numAmount)) {
    return "0.00";
  }

  return numAmount.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

