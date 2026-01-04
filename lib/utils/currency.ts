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
export function formatCurrency(amount: number, decimals: number = 2): string {
  return `${CURRENCY_SYMBOL}${amount.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
}

/**
 * Format a number as Indian Rupee currency without symbol (for display in tables, etc.)
 * @param amount - The amount to format
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted currency string (e.g., "1,234.56")
 */
export function formatCurrencyAmount(amount: number, decimals: number = 2): string {
  return amount.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

