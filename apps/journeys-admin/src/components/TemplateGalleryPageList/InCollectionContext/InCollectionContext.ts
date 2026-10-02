import { createContext, useContext } from 'react'

export interface InCollectionContextValue {
  /** The collection whose grid this card is rendered in. */
  collectionId: string
  /** Its title, for menu copy and toasts. */
  collectionTitle: string
}

/**
 * Provided around each collection's card grid in TemplateGalleryPageList and
 * nowhere else — the All Templates pool and the plain journey lists leave it
 * undefined. Lets a JourneyCard menu item know it sits inside a collection,
 * and which one, without threading props through JourneyCard →
 * JourneyCardMenu → DefaultMenu.
 */
export const InCollectionContext = createContext<
  InCollectionContextValue | undefined
>(undefined)

/** The collection this card belongs to, or undefined outside a collection. */
export function useInCollection(): InCollectionContextValue | undefined {
  return useContext(InCollectionContext)
}
