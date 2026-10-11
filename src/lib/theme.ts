export type Theme = 'light' | 'dark'

export const currentTheme = (): Theme => (document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light')

export function applyTheme(theme: Theme) {
  const root = document.documentElement
  root.classList.add('theme-transition')
  root.dataset.theme = theme
  try {
    localStorage.setItem('theme', theme)
  } catch {
    /* storage unavailable: theme still applies for this session */
  }
  window.setTimeout(() => root.classList.remove('theme-transition'), 300)
}
