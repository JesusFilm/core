import { useEffect, useState } from 'react'

export function useHasNotch(): boolean {
  const [hasNotch, setHasNotch] = useState(false)

  useEffect(() => {
    const handleResize = (): void => {
      // console.log(document.documentElement.clientHeight)
      const windowWidth = window.innerWidth
      const documentWidth = document.documentElement.clientWidth
      const hasTopNotch = window.matchMedia('(display-mode: standalone)')
        .matches
        ? false
        : windowWidth - documentWidth > 0
      setHasNotch(hasTopNotch)
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return hasNotch
}
