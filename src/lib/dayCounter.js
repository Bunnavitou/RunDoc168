/**
 * Day Counter Logic for billing cycle
 */

/**
 * Get the day counter for the current month (1-indexed)
 * @param {Date} [date] - date to check (defaults to today)
 * @returns {number} day number (1 to days-in-month)
 */
export function getDayCounter(date = new Date()) {
  return date.getDate()
}

/**
 * Get total days in a given month
 * @param {Date} [date]
 * @returns {number}
 */
export function getDaysInMonth(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
}

/**
 * Get ring color based on day counter
 * grey: 1-20, amber: 21-27, red: 28+
 * @param {number} day
 * @returns {'grey'|'amber'|'red'}
 */
export function getDayRingColor(day) {
  if (day >= 28) return 'red'
  if (day >= 21) return 'amber'
  return 'grey'
}

/**
 * Get Tailwind / hex color for the ring stroke
 * @param {number} day
 * @returns {string} hex color
 */
export function getDayRingHex(day) {
  if (day >= 28) return '#D64045'   // red (primary)
  if (day >= 21) return '#8A6408'   // amber
  return '#B0B0B0'                   // grey
}

/**
 * Whether "Start Bill" button should be shown
 * @param {number} day
 * @returns {boolean}
 */
export function shouldShowStartBill(day) {
  return day >= 21
}

/**
 * Get the fraction of the month that has passed
 * @param {number} day
 * @param {number} daysInMonth
 * @returns {number} 0.0 – 1.0
 */
export function getMonthFraction(day, daysInMonth) {
  return Math.min(day / daysInMonth, 1)
}

/**
 * Format a Date as "March 2026" for display
 * @param {Date} [date]
 * @returns {string}
 */
export function formatMonthYear(date = new Date()) {
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

/**
 * Format a Date as "Mar 2026" (short)
 * @param {Date} [date]
 * @returns {string}
 */
export function formatMonthYearShort(date = new Date()) {
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}
