import { useEffect, useRef, useCallback, RefObject } from "react"

/**
 * Hook that detects clicks outside of the specified element
 *
 * @param handler - callback to execute when clicking outside
 * @param enabled - whether the listener is active (default: true)
 * @returns ref to attach to the element
 *
 * @example
 * ```tsx
 * const [isOpen, setIsOpen] = useState(false);
 * const ref = useClickOutside(() => setIsOpen(false));
 *
 * return (
 *   <div ref={ref}>
 *     {isOpen && <Dropdown />}
 *   </div>
 * );
 * ```
 */
export function useClickOutside<T extends HTMLElement = HTMLElement>(
  handler: (event: MouseEvent | TouchEvent) => void,
  enabled = true
): RefObject<T | null> {
  const ref = useRef<T>(null)
  const handlerRef = useRef(handler)

  // Update handler ref when handler changes
  useEffect(() => {
    handlerRef.current = handler
  }, [handler])

  useEffect(() => {
    if (!enabled) return

    const listener = (event: MouseEvent | TouchEvent) => {
      const el = ref.current

      // Do nothing if clicking ref's element or its descendants
      if (!el || el.contains(event.target as Node)) {
        return
      }

      handlerRef.current(event)
    }

    document.addEventListener("mousedown", listener)
    document.addEventListener("touchstart", listener)

    return () => {
      document.removeEventListener("mousedown", listener)
      document.removeEventListener("touchstart", listener)
    }
  }, [enabled])

  return ref
}

/**
 * Hook that detects clicks outside of multiple elements
 *
 * @param handler - callback to execute when clicking outside all refs
 * @param enabled - whether the listener is active (default: true)
 * @returns function to create refs
 *
 * @example
 * ```tsx
 * const { refs, addRef } = useClickOutsideMultiple(() => setIsOpen(false));
 *
 * return (
 *   <>
 *     <button ref={addRef}>Toggle</button>
 *     <div ref={addRef}>
 *       <Dropdown />
 *     </div>
 *   </>
 * );
 * ```
 */
export function useClickOutsideMultiple<T extends HTMLElement = HTMLElement>(
  handler: (event: MouseEvent | TouchEvent) => void,
  enabled = true
): {
  refs: RefObject<T[]>
  addRef: (el: T | null) => void
} {
  const refs = useRef<T[]>([])
  const handlerRef = useRef(handler)

  // Update handler ref when handler changes
  useEffect(() => {
    handlerRef.current = handler
  }, [handler])

  const addRef = useCallback((el: T | null) => {
    if (el && !refs.current.includes(el)) {
      refs.current.push(el)
    }
    // Clean up removed elements (ref callback passes null on unmount)
    if (el === null) {
      refs.current = refs.current.filter((ref) => document.body.contains(ref))
    }
  }, [])

  useEffect(() => {
    if (!enabled) return

    const listener = (event: MouseEvent | TouchEvent) => {
      // Check if click is inside any of the refs
      const isInside = refs.current.some((el) => el && el.contains(event.target as Node))

      if (!isInside) {
        handlerRef.current(event)
      }
    }

    document.addEventListener("mousedown", listener)
    document.addEventListener("touchstart", listener)

    return () => {
      document.removeEventListener("mousedown", listener)
      document.removeEventListener("touchstart", listener)
    }
  }, [enabled])

  return { refs, addRef }
}

/**
 * Hook that detects escape key press
 *
 * @param handler - callback to execute when escape is pressed
 * @param enabled - whether the listener is active (default: true)
 *
 * @example
 * ```tsx
 * useEscapeKey(() => setIsOpen(false), isOpen);
 * ```
 */
export function useEscapeKey(handler: (event: KeyboardEvent) => void, enabled = true): void {
  const handlerRef = useRef(handler)

  useEffect(() => {
    handlerRef.current = handler
  }, [handler])

  useEffect(() => {
    if (!enabled) return

    const listener = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handlerRef.current(event)
      }
    }

    document.addEventListener("keydown", listener)

    return () => {
      document.removeEventListener("keydown", listener)
    }
  }, [enabled])
}

/**
 * Hook that combines click outside and escape key detection
 * Useful for modals and dropdowns
 *
 * @param handler - callback to execute when clicking outside or pressing escape
 * @param enabled - whether the listeners are active (default: true)
 * @returns ref to attach to the element
 *
 * @example
 * ```tsx
 * const ref = useClickOutsideOrEscape(() => setIsOpen(false), isOpen);
 *
 * return (
 *   <div ref={ref}>
 *     <Modal />
 *   </div>
 * );
 * ```
 */
export function useClickOutsideOrEscape<T extends HTMLElement = HTMLElement>(
  handler: (event: MouseEvent | TouchEvent | KeyboardEvent) => void,
  enabled = true
): RefObject<T | null> {
  const ref = useClickOutside<T>(handler, enabled)
  useEscapeKey(handler, enabled)

  return ref
}
