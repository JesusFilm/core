import { useEffect, useMemo } from 'react'
import WebFont from 'webfontloader'

interface FontLoaderProps {
  fonts: string[]
}

export function FontLoader({ fonts }: FontLoaderProps): null {
  function getSortedUniqueFonts(fonts: string[]): string[] {
    return [...new Set(fonts.filter((font) => font !== ''))].sort()
  }

  function formatFontWithWeights(font: string): string {
    return `${font}:400,500,600,700,800`
  }

  const fontFamilies = useMemo(() => {
    const validFonts = getSortedUniqueFonts(fonts)
    return validFonts.map(formatFontWithWeights)
  }, [fonts])

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
