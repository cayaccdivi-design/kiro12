import { useCallback, useRef, useState } from 'react'

// Lightweight history hook with a capped stack.
// Designed for React state objects (we keep references; consumer is
// responsible for using immutable updates).
//
// Returns: [state, set, { undo, redo, canUndo, canRedo, reset }]
export default function useHistory(initial, { limit = 50 } = {}) {
  const [state, setState] = useState(initial)
  const past   = useRef([])
  const future = useRef([])

  const set = useCallback((next, { commit = true } = {}) => {
    setState(prev => {
      const value = typeof next === 'function' ? next(prev) : next
      if (commit && value !== prev) {
        past.current.push(prev)
        if (past.current.length > limit) past.current.shift()
        future.current.length = 0
      }
      return value
    })
  }, [limit])

  const undo = useCallback(() => {
    setState(prev => {
      const last = past.current.pop()
      if (last === undefined) return prev
      future.current.push(prev)
      return last
    })
  }, [])

  const redo = useCallback(() => {
    setState(prev => {
      const next = future.current.pop()
      if (next === undefined) return prev
      past.current.push(prev)
      return next
    })
  }, [])

  const reset = useCallback((value) => {
    past.current.length = 0
    future.current.length = 0
    setState(value)
  }, [])

  return [state, set, {
    undo, redo, reset,
    canUndo: past.current.length > 0,
    canRedo: future.current.length > 0,
  }]
}
