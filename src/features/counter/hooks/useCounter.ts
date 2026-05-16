import { useState, useCallback, useEffect } from 'react'
import { storage } from '@/lib/storage'

const COUNTER_STORAGE_KEY = 'project-counter-value'

interface UseCounterOptions {
  initialValue?: number
  min?: number
  max?: number
  step?: number
}

interface UseCounterReturn {
  count: number
  increment: () => void
  decrement: () => void
  reset: () => void
  setCount: (value: number) => void
}

export function useCounter({
  initialValue = 0,
  min = -Infinity,
  max = Infinity,
  step = 1,
}: UseCounterOptions = {}): UseCounterReturn {
  const [count, setCountState] = useState(() => {
    return storage.get<number>(COUNTER_STORAGE_KEY, initialValue)
  })

  useEffect(() => {
    storage.set(COUNTER_STORAGE_KEY, count)
  }, [count])

  const increment = useCallback(() => {
    setCountState((prev) => Math.min(prev + step, max))
  }, [step, max])

  const decrement = useCallback(() => {
    setCountState((prev) => Math.max(prev - step, min))
  }, [step, min])

  const reset = useCallback(() => {
    setCountState(initialValue)
  }, [initialValue])

  const setCount = useCallback(
    (value: number) => {
      setCountState(Math.min(Math.max(value, min), max))
    },
    [min, max]
  )

  return {
    count,
    increment,
    decrement,
    reset,
    setCount,
  }
}
