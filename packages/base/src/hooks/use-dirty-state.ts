import { useState, useCallback, useRef, useMemo } from "react"

interface UseDirtyStateReturn<T> {
  /** Current value */
  value: T
  /** Update the current value */
  setValue: (value: T | ((prev: T) => T)) => void
  /** Whether the value has changed from the original */
  isDirty: boolean
  /** Reset value back to the original */
  reset: () => void
  /** The original (initial) value */
  original: T
}

/**
 * Hook that tracks whether state has changed from its initial value.
 *
 * Uses deep comparison via JSON.stringify to determine dirtiness.
 * Provides a reset function to revert to the original value.
 *
 * @param initialValue - The initial value to track changes against
 * @returns Object with value, setValue, isDirty, reset, and original
 *
 * @example
 * ```tsx
 * const { value, setValue, isDirty, reset, original } = useDirtyState({
 *   name: 'John',
 *   age: 30,
 * });
 *
 * return (
 *   <form>
 *     <input
 *       value={value.name}
 *       onChange={(e) => setValue((prev) => ({ ...prev, name: e.target.value }))}
 *     />
 *     {isDirty && <button onClick={reset}>Discard Changes</button>}
 *     {isDirty && <button type="submit">Save</button>}
 *   </form>
 * );
 * ```
 */
export function useDirtyState<T>(initialValue: T): UseDirtyStateReturn<T> {
  const originalRef = useRef(initialValue)
  const [value, setValueInternal] = useState<T>(initialValue)

  const serializedOriginal = JSON.stringify(originalRef.current)

  const isDirty = useMemo(() => {
    try {
      return JSON.stringify(value) !== serializedOriginal
    } catch {
      // Fallback to reference equality if JSON.stringify fails
      return value !== originalRef.current
    }
  }, [value, serializedOriginal])

  const setValue = useCallback((newValue: T | ((prev: T) => T)) => {
    setValueInternal(newValue)
  }, [])

  const reset = useCallback(() => {
    setValueInternal(originalRef.current)
  }, [])

  return {
    value,
    setValue,
    isDirty,
    reset,
    original: originalRef.current,
  }
}
