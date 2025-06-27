import { useEffect, useMemo } from 'react'
import WebFont from 'webfontloader'

import { GetJourney_journey_journeyTheme as JourneyTheme } from '../../../../__generated__/GetJourney'

interface FontLoaderProps {
  journeyTheme: JourneyTheme | null
}

export function FontLoader({ journeyTheme }: FontLoaderProps): null {
  const fontFamilies = useMemo(
    () =>
      journeyTheme
        ? [
            ...new Set([
              journeyTheme.headerFont,
              journeyTheme.bodyFont,
              journeyTheme.labelFont
            ])
          ]
            .filter(Boolean)
            .map(formatFontWithWeights)
        : [],
    [journeyTheme]
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
