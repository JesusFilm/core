import { createContext, useContext } from 'react'

/**
 * Lets descendant components (specifically `JourneyCard` and its menu) tell
 * the LTL gallery when any of their portaled dialogs is open, so the gallery
 * can mark its DnD subtree `inert` and stop dnd-kit's document-level sensors
 * from picking up cursor movement behind the dialog.
 *
 * NES-1666 v1 fix only covered `CollectionDialog`. v2 (per Sharon's repro)
 * extends the lock to the per-card "Edit Template Details" /
 * "Edit Journey Details" dialogs, plus every other dialog rendered by
 * `JourneyCardMenu` (access / restore / delete / trash / translate) and
 * the `TemplateBreakdownAnalyticsDialog` rendered by `JourneyCard` itself.
 *
 * The context is intentionally opt-in: `JourneyCard` is used in many places
 * outside the LTL gallery (ActiveJourneyList, ArchivedJourneyList, etc.) and
 * the hook is a no-op when no provider is mounted.
 */
export interface GalleryDialogLockContextValue {
  /**
   * Called by a descendant card whenever any dialog it owns toggles open or
   * closed. `cardId` is the journey id; the provider tracks the set of cards
   * with open dialogs and lifts the page-level `dialogOpen` flag whenever
   * the set is non-empty.
   */
  onDialogOpenChange: (cardId: string, open: boolean) => void
}

export const GalleryDialogLockContext =
  createContext<GalleryDialogLockContextValue | null>(null)

export function useGalleryDialogLock(): GalleryDialogLockContextValue | null {
  return useContext(GalleryDialogLockContext)
}
