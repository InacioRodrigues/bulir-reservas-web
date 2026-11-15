import { useCallback, useEffect, useState } from 'react'

/** Contagem decrescente em segundos (ex.: respeitar o Retry-After de um 429). */
export function useCountdown() {
  const [secondsLeft, setSecondsLeft] = useState(0)

  useEffect(() => {
    if (secondsLeft <= 0) return
    const timer = window.setTimeout(() => setSecondsLeft((value) => value - 1), 1000)
    return () => window.clearTimeout(timer)
  }, [secondsLeft])

  const start = useCallback((seconds: number) => setSecondsLeft(Math.max(0, seconds)), [])
  return { secondsLeft, active: secondsLeft > 0, start }
}
