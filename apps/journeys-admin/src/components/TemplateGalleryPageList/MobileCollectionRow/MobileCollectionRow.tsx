import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { ReactElement, forwardRef } from 'react'

import { GetTemplateGalleryPages_templateGalleryPages as TemplateGalleryPage } from '../../../../__generated__/GetTemplateGalleryPages'

import { AllTemplatesChip } from './AllTemplatesChip'
import { CollectionChip } from './CollectionChip'

export interface MobileCollectionRowProps {
  collections: readonly TemplateGalleryPage[]
  /** Total number of templates across all states (sectioned + unsectioned). */
  allTemplatesCount: number
  /** Currently-selected collection id, or null when "All Templates" is the
   * active filter. */
  selectedCollectionId: string | null
  onSelect: (collectionId: string | null) => void
  /** Disables drop targets on every chip (e.g. while a previous mutation
   * is in flight or a dialog is open). */
  dropDisabled?: boolean
}

/**
 * Sticky horizontal-scroll row of filter chips for the mobile gallery view.
 *
 * The chips double as drop targets — drop wiring is layered on top by the
 * parent (see Step 6). The scroll container's ref is exposed so dnd-kit's
 * auto-scroll can engage it during a drag (see Step 7).
 */
export const MobileCollectionRow = forwardRef<
  HTMLDivElement,
  MobileCollectionRowProps
>(function MobileCollectionRow(
  {
    collections,
    allTemplatesCount,
    selectedCollectionId,
    onSelect,
    dropDisabled = false
  },
  ref
): ReactElement {
  function handleSelectAll(): void {
    onSelect(null)
  }
  function handleSelectCollection(id: string): void {
    onSelect(id)
  }

  return (
    <Box
      ref={ref}
      data-testid="MobileCollectionRow"
      sx={{
        position: 'sticky',
        top: 0,
        zIndex: 2,
        // Page-gray (background.default) so the sticky row blends into the
        // page while it covers list rows scrolling beneath it; only the chips
        // themselves are white (background.paper).
        backgroundColor: 'background.default',
        overflowX: 'auto',
        overflowY: 'hidden',
        // Hide the scrollbar visually; users scroll by touch.
        scrollbarWidth: 'none',
        '&::-webkit-scrollbar': { display: 'none' },
        py: 1.5,
        // Bleed the scroll container past both the gallery's own `p`
        // (xs:2 / md:4) and MainPanelBody's body padding (px: { xs: 0, sm: 8 })
        // so the chip row runs edge-to-edge of the available area on every
        // breakpoint — phone/tablet to the screen edges, desktop to the navbar
        // edge on the left and the info help panel edge on the right. The
        // gallery's text headers stay inset within the gallery's padding.
        mx: { xs: -2, sm: -10, md: -12 },
        // Inner padding keeps the first chip (All Templates) aligned with its
        // existing position when scrolled to the start: original 8px inset on
        // mobile, and on desktop pl:14 (= gallery padding 16 + MainPanelBody
        // padding 32 + original 8px inset) so it lands exactly where it sat
        // before the bleed.
        pl: { xs: 2, md: 14 },
        pr: 2
      }}
    >
      {/* spacing 3 (12px) matches the journey-card grid gap below the chips
          (COLLECTION_GRID_SPACING), keeping the gaps consistent down the page. */}
      <Stack direction="row" spacing={3} sx={{ width: 'max-content' }}>
        <AllTemplatesChip
          selected={selectedCollectionId == null}
          count={allTemplatesCount}
          onSelect={handleSelectAll}
          dropDisabled={dropDisabled}
        />
        {collections.map((collection) => (
          <CollectionChip
            key={collection.id}
            collection={collection}
            selected={selectedCollectionId === collection.id}
            onSelect={handleSelectCollection}
            dropDisabled={dropDisabled}
          />
        ))}
      </Stack>
    </Box>
  )
})
