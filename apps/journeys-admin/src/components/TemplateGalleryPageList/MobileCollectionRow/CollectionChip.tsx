import { useDroppable } from '@dnd-kit/core'
import Box from '@mui/material/Box'
import ButtonBase from '@mui/material/ButtonBase'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Image from 'next/image'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement } from 'react'

import { GetTemplateGalleryPages_templateGalleryPages as TemplateGalleryPage } from '../../../../__generated__/GetTemplateGalleryPages'
import { TemplateGalleryPageStatus } from '../../../../__generated__/globalTypes'
import logoGray from '../../../../public/logo-grayscale.svg'
import { encodeDropZoneId } from '../Droppables'

const CHIP_WIDTH = 250
const CHIP_HEIGHT = 72

export interface CollectionChipProps {
  collection: TemplateGalleryPage
  selected: boolean
  onSelect: (id: string) => void
  /** When true, the chip will not register as a drop target. Used while
   * a previous mutation is in flight, when a dialog is open, or when the
   * collection itself is published (no further membership edits allowed). */
  dropDisabled?: boolean
}

/**
 * Collection filter as a small card: the first template's image fills the
 * left third, the collection title and a template-count subtext fill the
 * right two thirds. Card-like (not pill-like) to match the collection cards.
 * Doubles as a dnd-kit drop target and a selectable filter.
 */
export function CollectionChip({
  collection,
  selected,
  onSelect,
  dropDisabled = false
}: CollectionChipProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const isPublished = collection.status === TemplateGalleryPageStatus.published
  const count = collection.templates.length
  const imageSrc = collection.templates[0]?.primaryImageBlock?.src ?? null
  const { setNodeRef, isOver } = useDroppable({
    id: encodeDropZoneId({ kind: 'collection', id: collection.id }),
    disabled: dropDisabled || isPublished
  })
  const active = selected || isOver

  function handleClick(): void {
    onSelect(collection.id)
  }

  return (
    <ButtonBase
      data-testid={`CollectionChip-${collection.id}`}
      ref={setNodeRef}
      onClick={handleClick}
      aria-pressed={selected}
      aria-label={collection.title}
      sx={{
        width: CHIP_WIDTH,
        height: CHIP_HEIGHT,
        flexShrink: 0,
        display: 'flex',
        alignItems: 'stretch',
        textAlign: 'left',
        // Card-like radius, not a pill.
        borderRadius: 2,
        overflow: 'hidden',
        border: 1,
        borderColor: active ? 'primary.main' : 'divider',
        backgroundColor: 'background.paper',
        outline: isOver ? '2px solid' : 'none',
        outlineColor: 'primary.dark',
        outlineOffset: 2,
        transition: 'border-color 120ms ease, outline-color 120ms ease'
      }}
    >
      {/* First template's image — the left third. */}
      <Box
        sx={{
          position: 'relative',
          width: '33.333%',
          flexShrink: 0,
          bgcolor: 'rgba(0, 0, 0, 0.06)'
        }}
      >
        {imageSrc != null ? (
          <Image
            src={imageSrc}
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

      {/* Title + template count — the right two thirds. */}
      <Stack
        spacing={0.25}
        sx={{ flex: 1, minWidth: 0, justifyContent: 'center', px: 1.5 }}
      >
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
            variant="subtitle2"
            noWrap
            sx={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}
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
  )
}
