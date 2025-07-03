import { useEffect, useMemo } from 'react'
import WebFont from 'webfontloader'

interface FontLoaderProps {
  fonts: (string | null)[]
}

export function FontLoader({ fonts }: FontLoaderProps): null {
  const fontFamilies = useMemo(
    () =>
      fonts && fonts.length > 0
        ? [...new Set(fonts)].filter(Boolean).sort().map(formatFontWithWeights)
        : [],
    [fonts]
  )

  function formatFontWithWeights(font: string): string {
    return `${font}:400,500,600,700,800`
  }

  useEffect(() => {
    if (fontFamilies.length === 0) return

    WebFont.load({
      google: {
        families: fontFamilies
      }
    })
  }, [fontFamilies])

  return null
}
