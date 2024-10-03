import { useEffect, useState } from 'react'

export function useMediaQuery(mediaQuery: string): boolean {
  const matchMediaRegex =
    /^@media\s*\((min-width|max-width):\s*\d+(\.\d+)?px\)$/g

  if (mediaQuery.match(matchMediaRegex) == null)
    throw new Error(
      "please pass in MUI theme breakpoints e.g. theme.breakpoints.up('sm')"
    )

  const [isMatch, setIsMatch] = useState(false)
  useEffect(() => {
    const formattedmediaQuery = mediaQuery.replace('@media', '').trim()

    const mql = window.matchMedia(formattedmediaQuery)
    function onChange(): void {
      setIsMatch(!!mql.matches)
    }
    mql.addEventListener('change', onChange)
    setIsMatch(mql.matches)
    return () => mql.removeEventListener('change', onChange)
  }, [mediaQuery])

  return isMatch
}
