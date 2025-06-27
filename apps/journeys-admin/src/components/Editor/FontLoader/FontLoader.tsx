import { useEffect } from 'react'
import WebFont from 'webfontloader'

interface FontLoaderProps {
  fontFamilies: string[]
}

export function FontLoader({ fontFamilies }: FontLoaderProps): null {
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
