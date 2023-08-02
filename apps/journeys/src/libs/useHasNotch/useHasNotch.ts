import { useEffect, useState } from 'react'

export function useHasNotch(): string {
  // const [hasNotch, setHasNotch] = useState(false)
  const [returnString, setReturnString] = useState('')

  useEffect(() => {
    const handleResize = (): void => {
      const windowWidth = window.innerWidth
      const documentWidth = document.documentElement.clientWidth
      // const hasTopNotch = window.matchMedia('(display-mode: standalone)')
      //   .matches
      //   ? false
      //   : windowWidth - documentWidth > 0
      // setHasNotch(hasTopNotch)
      setReturnString(
        `windowWidth: ${windowWidth},
         documentWidth: ${documentWidth},
          standAlone: ${
            window.matchMedia('(display-mode: standalone)').matches
              ? 'true'
              : 'false'
          }`
      )
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return returnString
}
