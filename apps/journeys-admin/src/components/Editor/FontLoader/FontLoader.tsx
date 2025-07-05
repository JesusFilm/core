import { useEffect, useMemo } from 'react'

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
    // Only run in browser environment and if there are fonts to load
    if (typeof window === 'undefined' || fontFamilies.length === 0) return

    // Dynamic import WebFont only on client side
    void import(/* webpackChunkName: "webfontloader" */ 'webfontloader')
      .then((WebFont) => {
        WebFont.load({
          google: {
            families: fontFamilies
          },
          fontinactive: (familyName, fvd) => {
            throw new Error(`Font inactive: ${familyName} (${fvd})`)
          }
        })
      })
      .catch((error) => {
        console.error(error)
      })
  }, [fontFamilies])

  return null
}
