import { createContext, useContext } from 'react'

/**
 * Lets descendant components (specifically `JourneyCard` and its menu) tell
 * when they are rendered inside a Collection card on the template gallery
 * page, so the menu can gate the "Copy to collection…" action to that
 * subtree only.
 *
 * `JourneyCard` is reused across at least five contexts
 * (`ActiveJourneyList`, `ArchivedJourneyList`, `TrashedJourneyList`,
 * All-Templates, Collections); a context-based gate is purely additive
 * (no prop-signature changes through `JourneyCard → JourneyCardMenu →
 * DefaultMenu`) and read at the menu-item site via `useInCollection()`.
 *
 * The context is intentionally opt-in: the provider is only mounted by
 * `TemplateGalleryPageList` around the Collection-grid path, leaving the
 * All-Templates path and every other consumer of `JourneyCard`
 * uncovered. `useInCollection()` returns `false` when no provider is in
 * the tree.
 *
 * `useGalleryDialogLock` cannot be reused for this purpose because the
 * existing lock provider wraps both the Collections grid AND the
 * All-Templates grid, so it cannot distinguish the two contexts.
 */
export const InCollectionContext = createContext<boolean>(false)

export function useInCollection(): boolean {
  return useContext(InCollectionContext)
}
