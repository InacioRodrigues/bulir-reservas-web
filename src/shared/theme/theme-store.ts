import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Theme = 'light' | 'dark' | 'system'

interface ThemeState {
  theme: Theme
  setTheme: (theme: Theme) => void
}

/** Preferência de tema do utilizador (estado de cliente, persistido no localStorage). */
export const useThemeStore = create<ThemeState>()(
  persist((set) => ({ theme: 'system', setTheme: (theme) => set({ theme }) }), {
    name: 'bulir-theme',
  }),
)

const darkQuery = () => window.matchMedia('(prefers-color-scheme: dark)')

export function resolveTheme(theme: Theme): 'light' | 'dark' {
  if (theme !== 'system') return theme
  return darkQuery().matches ? 'dark' : 'light'
}

/** Aplica a classe `.dark` no <html> e acompanha mudanças do sistema operativo. */
export function startThemeSync() {
  const apply = () => {
    const resolved = resolveTheme(useThemeStore.getState().theme)
    document.documentElement.classList.toggle('dark', resolved === 'dark')
  }
  apply()
  const unsubscribe = useThemeStore.subscribe(apply)
  const media = darkQuery()
  media.addEventListener('change', apply)
  return () => {
    unsubscribe()
    media.removeEventListener('change', apply)
  }
}
