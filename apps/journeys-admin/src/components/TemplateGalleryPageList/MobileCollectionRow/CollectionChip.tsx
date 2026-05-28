import { useDroppable } from '@dnd-kit/core'
import Box from '@mui/material/Box'
import ButtonBase from '@mui/material/ButtonBase'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import Image from 'next/image'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement } from 'react'

import { GetTemplateGalleryPages_templateGalleryPages as TemplateGalleryPage } from '../../../../__generated__/GetTemplateGalleryPages'
import { TemplateGalleryPageStatus } from '../../../../__generated__/globalTypes'
import logoGray from '../../../../public/logo-grayscale.svg'
import { LabelChip } from '../../LabelChip'
import { encodeDropZoneId } from '../Droppables'

export interface CollectionChipProps {
  collection: TemplateGalleryPage
  selected: boolean
  onSelect: (id: string) => void
  /** When true, the chip will not register as a drop target. Used while
   * a previous mutation is in flight, when a dialog is open, or when the
   * collection itself is published (no further membership edits allowed). */
  dropDisabled?: boolean
}

// A cell in the chip's preview grid: a template image, or the "+N" overflow
// counter shown when a collection has more templates than the grid can show.
type ChipImageTile =
  | { key: string; src: string | null }
  | { key: string; overflow: number }

/**
 * Collection filter as a card: a preview of the collection's template images on
 * the left, the collection title and a template-count subtext on the right. On
 * desktop the chip is enlarged and the preview is a 2x2 grid of up to four
 * images (>4 templates → three images + a "+N" tile); on mobile it stays
 * compact with a single image. A status label (Live / Draft) sits beside the
 * title. Doubles as a dnd-kit drop target and a selectable filter.
 */
export function CollectionChip({
  collection,
  selected,
  onSelect,
  dropDisabled = false
}: CollectionChipProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const isPublished = collection.status === TemplateGalleryPageStatus.published
  const templates = collection.templates
  const count = templates.length

  // Desktop preview shows up to four images. With more than four templates,
  // show the first three plus a "+N" tile where N is the remaining count.
  // Mobile shows only the first tile (the rest are hidden via CSS).
  const imageTiles: ChipImageTile[] =
    count === 0
      ? [{ key: 'empty', src: null }]
      : count > 4
        ? [
            ...templates.slice(0, 3).map((tpl) => ({
              key: tpl.id,
              src: tpl.primaryImageBlock?.src ?? null
            })),
            { key: 'overflow', overflow: count - 3 }
          ]
        : templates.slice(0, 4).map((tpl) => ({
            key: tpl.id,
            src: tpl.primaryImageBlock?.src ?? null
          }))
  const singleTile = imageTiles.length === 1

  const { setNodeRef, isOver } = useDroppable({
    id: encodeDropZoneId({ kind: 'collection', id: collection.id }),
    // Published collections can't accept membership changes, but stay a
    // registered drop target so a drag-over can show a "not allowed" state;
    // useDragEndHandler rejects the drop (no-op, the card snaps back). Only the
    // hard locks (busy / open dialog) fully disable the target.
    disabled: dropDisabled
  })
  // A template is being dragged over a published collection — it can't land here.
  const dropBlocked = isOver && isPublished
  const active = selected || (isOver && !isPublished)

  function handleClick(): void {
    onSelect(collection.id)
  }

  return (
    <Tooltip
      title={t("Templates can't be moved into live collections")}
      open={dropBlocked}
      placement="top"
      arrow
      disableHoverListener
      disableFocusListener
      disableTouchListener
    >
      <ButtonBase
        data-testid={`CollectionChip-${collection.id}`}
        ref={setNodeRef}
        onClick={handleClick}
        aria-pressed={selected}
        aria-label={collection.title}
        sx={{
          // Enlarged on desktop (md+); compact on mobile (xs/sm).
          width: { xs: 250, md: 400 },
          height: { xs: 72, md: 144 },
          flexShrink: 0,
          display: 'flex',
          alignItems: 'stretch',
          textAlign: 'left',
          // Card-like radius, not a pill.
          borderRadius: 2,
          overflow: 'hidden',
          border: 1,
          // A grey dashed border (plus the tooltip) marks a published collection
          // as a blocked drop target; a valid target shows the solid blue "drop
          // here" border + ring instead.
          borderStyle: dropBlocked ? 'dashed' : 'solid',
          borderColor: dropBlocked
            ? 'text.disabled'
            : active
              ? 'primary.main'
              : // Original light border on mobile; one step darker on desktop.
                { xs: 'divider', md: 'grey.400' },
          backgroundColor: 'background.paper',
          outline: isOver && !isPublished ? '2px solid' : 'none',
          outlineColor: 'primary.dark',
          outlineOffset: 2,
          cursor: dropBlocked ? 'not-allowed' : undefined,
          transition: 'border-color 120ms ease, outline-color 120ms ease'
        }}
      >
        {/* Template image preview — the left third. Single image on mobile; a
            2x2 grid (up to 4 images, or 3 + a "+N" tile) on desktop. */}
        <Box
          sx={{
            position: 'relative',
            // Mobile: a third of the compact chip. Desktop: a fixed-width 2x2
            // preview so shrinking the chip only narrows the text side.
            width: { xs: '33.333%', md: 168 },
            flexShrink: 0,
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
            gridTemplateRows: { xs: '1fr', md: '1fr 1fr' },
            gap: '2px',
            bgcolor: { xs: 'rgba(0, 0, 0, 0.06)', md: 'grey.200' }
          }}
        >
          {imageTiles.map((tile, index) => (
            <Box
              key={tile.key}
              sx={{
                position: 'relative',
                overflow: 'hidden',
                // Original subtle fill on mobile; on desktop a mid-grey well
                // dark enough to read as distinct, yet still lighter than the
                // placeholder logo's light-grey segment (#DEDFE0 / divider) so
                // the logo doesn't blend in.
                bgcolor: { xs: 'rgba(0, 0, 0, 0.06)', md: 'grey.200' },
                // The first tile always shows; the rest of the 2x2 grid is
                // desktop-only (mobile keeps a single image).
                display: index === 0 ? 'block' : { xs: 'none', md: 'block' },
                // A lone image fills the whole preview instead of sitting in one
                // quadrant.
                ...(singleTile
                  ? { gridColumn: '1 / -1', gridRow: '1 / -1' }
                  : {})
              }}
            >
              {'overflow' in tile ? (
                <Box
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'rgba(0, 0, 0, 0.55)'
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    sx={{ color: 'common.white', fontWeight: 600 }}
                  >
                    +{tile.overflow}
                  </Typography>
                </Box>
              ) : tile.src != null ? (
                <Image
                  src={tile.src}
                  alt=""
                  fill
                  sizes="84px"
                  style={{ objectFit: 'cover' }}
                />
              ) : (
                <Image
                  src={logoGray}
                  alt=""
                  width={28}
                  height={28}
                  style={{
                    objectFit: 'contain',
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)'
                  }}
                />
              )}
            </Box>
          ))}
        </Box>

        {/* Status, title and count. Mobile keeps the original compact dot +
            single-line title; desktop stacks a status label above a two-line
            title. */}
        <Stack
          spacing={{ xs: 0.25, md: 0.5 }}
          sx={{ flex: 1, minWidth: 0, justifyContent: 'center', px: 1.5 }}
        >
          {/* Desktop-only status label (mobile uses the dot below). */}
          <LabelChip
            data-testid="CollectionChipStatusLabel"
            color={isPublished ? 'success' : 'default'}
            label={isPublished ? t('Live') : t('Draft')}
            sx={{
              alignSelf: 'flex-start',
              display: { xs: 'none', md: 'inline-flex' }
            }}
          />
          <Stack
            direction="row"
            alignItems="center"
            spacing={0.75}
            sx={{ minWidth: 0 }}
          >
            {/* Mobile-only status dot (desktop uses the label above). */}
            <Box
              data-testid="CollectionChipStatusDot"
              aria-hidden
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: isPublished ? 'success.main' : 'warning.main',
                flexShrink: 0,
                display: { xs: 'block', md: 'none' }
              }}
            />
            <Typography
              variant="subtitle2"
              sx={{
                minWidth: 0,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                // Mobile: single-line ellipsis. Desktop: up to two lines.
                whiteSpace: { xs: 'nowrap', md: 'normal' },
                display: { xs: 'block', md: '-webkit-box' },
                WebkitBoxOrient: 'vertical',
                WebkitLineClamp: { md: 2 }
              }}
            >
              {collection.title}
            </Typography>
          </Stack>
          <Typography variant="caption" color="text.secondary" noWrap>
            {t('{{count}} templates', {
              count,
              defaultValue_one: '{{count}} template',
              defaultValue_other: '{{count}} templates'
            })}
          </Typography>
        </Stack>
      </ButtonBase>
    </Tooltip>
  )
}
