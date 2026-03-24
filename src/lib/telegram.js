/**
 * Telegram Mini App helpers
 */

export const tg = window.Telegram?.WebApp || null

export function isTelegramWebApp() {
  return !!(window.Telegram?.WebApp?.initData)
}

export function initTelegram() {
  if (tg) {
    tg.ready()
    tg.expand()
    // Set header color to match app theme
    if (tg.setHeaderColor) {
      tg.setHeaderColor('#2563EB')
    }
  }
}
