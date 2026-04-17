import { useState, useEffect } from 'react'

/** Returns true once the component has mounted on the client. */
export function useHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false)
  useEffect(() => { setHydrated(true) }, [])
  return hydrated
}
