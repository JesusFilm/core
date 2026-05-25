import { useDroppable } from '@dnd-kit/core'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { ReactElement } from 'react'

import { GetTemplateGalleryPages_templateGalleryPages as TemplateGalleryPage } from '../../../../__generated__/GetTemplateGalleryPages'
import { TemplateGalleryPageStatus } from '../../../../__generated__/globalTypes'
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

export function CollectionChip({
  collection,
  selected,
  onSelect,
  dropDisabled = false
}: CollectionChipProps): ReactElement {
  const isPublished = collection.status === TemplateGalleryPageStatus.published
  const count = collection.templates.length
  const isEmpty = count === 0
  const { setNodeRef, isOver } = useDroppable({
    id: encodeDropZoneId({ kind: 'collection', id: collection.id }),
    disabled: dropDisabled || isPublished
  })

  function handleClick(): void {
    onSelect(collection.id)
  }

  return (
    <Chip
      data-testid={`CollectionChip-${collection.id}`}
      ref={setNodeRef}
      clickable
      onClick={handleClick}
      variant={selected || isOver ? 'filled' : 'outlined'}
      color={selected || isOver ? 'primary' : 'default'}
      aria-pressed={selected}
      aria-label={collection.title}
      sx={{
        maxWidth: 200,
        opacity: isEmpty ? 0.6 : 1,
        flexShrink: 0,
        height: 36,
        // Bump the drop-target outline so users can see which chip is
        // about to receive the drop, even on chips that are already
        // filled (the selected chip).
        outline: isOver ? '2px solid' : 'none',
        outlineColor: 'primary.dark',
        outlineOffset: 2,
        transition: 'outline-color 120ms ease, background-color 120ms ease',
        '& .MuiChip-label': {
          px: 1.5,
          display: 'flex',
          alignItems: 'center',
          overflow: 'visible'
        }
      }}
      label={
        <Stack direction="row" alignItems="center" spacing={0.75}>
          <Box
            data-testid="CollectionChipStatusDot"
            aria-hidden
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              bgcolor: isPublished ? 'success.main' : 'warning.main',
              flexShrink: 0
            }}
          />
          <Typography
            variant="body2"
            noWrap
            sx={{
              maxWidth: 130,
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            {collection.title}
          </Typography>
          <Typography
            variant="caption"
            color={selected ? 'inherit' : 'text.secondary'}
            sx={{ flexShrink: 0 }}
          >
            · {count}
          </Typography>
        </Stack>
      }
    />
  )
}
