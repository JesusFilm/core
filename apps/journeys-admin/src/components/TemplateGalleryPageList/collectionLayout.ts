/**
 * Shared layout constants for the collections grid (NES-1696).
 *
 * Three values must stay in lockstep or the in-collection card grid stops
 * column-aligning with the All Templates grid below:
 *  - the CollectionCard's inner padding,
 *  - the collections Stack's negative-margin bleed (= padding + border), and
 *  - the DraggableJourneysGrid card gap (kept equal to the padding by design).
 *
 * Deriving the bleed and the gap from these constants removes the silent
 * drift risk that hand-synced magic numbers carried.
 */

/** CollectionCard inner padding, in theme spacing units (3 → 12px). */
export const COLLECTION_CARD_PADDING = 3

/** CollectionCard border width, in pixels. */
export const COLLECTION_CARD_BORDER_WIDTH = 1

/**
 * Card gap for the journey grid. Equal to the card padding so the gap from a
 * card to the collection edge matches the gap between cards.
 */
export const COLLECTION_GRID_SPACING = COLLECTION_CARD_PADDING
