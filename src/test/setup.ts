import '@testing-library/jest-dom/vitest'
import { cleanup, configure } from '@testing-library/react'
import { server } from './server'
import { useSessionStore } from '@/shared/session/session-store'

// O primeiro render de cada ficheiro carrega o Radix/zod a frio; 1 s por omissão é curto.
configure({ asyncUtilTimeout: 5000 })

// Polyfills que o jsdom não tem e o Radix UI usa.
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver ??= ResizeObserverStub as unknown as typeof ResizeObserver
Element.prototype.scrollIntoView ??= () => {}
Element.prototype.hasPointerCapture ??= () => false
Element.prototype.releasePointerCapture ??= () => {}
window.matchMedia ??= (query: string) =>
  ({
    matches: false,
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
  }) as unknown as MediaQueryList

beforeAll(() => server.listen({ onUnhandledFrame: 'error' }))
afterEach(() => {
  cleanup()
  server.resetHandlers()
  useSessionStore.getState().clear()
  localStorage.clear()
})
afterAll(() => server.close())
