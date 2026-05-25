import { createContext, useContext } from 'react'

import { GalleryStyle, galleryStyles } from './galleryStyles'

/**
 * Ambient style preset for the gallery, supplied by `TemplateGalleryView`
 * and consumed by the header, grid and cards. Defaults to the original
 * look so components render correctly outside the provider (e.g. tests).
 */
const GalleryStyleContext = createContext<GalleryStyle>(galleryStyles[0])

export const GalleryStyleProvider = GalleryStyleContext.Provider

export function useGalleryStyle(): GalleryStyle {
  return useContext(GalleryStyleContext)
}
