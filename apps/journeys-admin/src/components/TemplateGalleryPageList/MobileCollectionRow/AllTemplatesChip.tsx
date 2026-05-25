import { useDroppable } from '@dnd-kit/core'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement } from 'react'

import { encodeDropZoneId } from '../Droppables'

export interface AllTemplatesChipProps {
  selected: boolean
  count: number
  onSelect: () => void
  /** When true, the chip will not accept drops. Used while a previous
   * mutation is in flight or a dialog is open. */
  dropDisabled?: boolean
}

export function AllTemplatesChip({
  selected,
  count,
  onSelect,
  dropDisabled = false
}: AllTemplatesChipProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { setNodeRef, isOver } = useDroppable({
    id: encodeDropZoneId({ kind: 'unsectioned' }),
    disabled: dropDisabled
  })

  return (
    <Chip
      data-testid="AllTemplatesChip"
      ref={setNodeRef}
      clickable
      onClick={onSelect}
      variant={isOver ? 'filled' : 'outlined'}
      color={selected || isOver ? 'primary' : 'default'}
      aria-pressed={selected}
      aria-label={t('All Templates')}
      sx={{
        flexShrink: 0,
        height: 36,
        borderWidth: selected ? 2 : 1,
        outline: isOver ? '2px solid' : 'none',
        outlineColor: 'primary.dark',
        outlineOffset: 2,
        transition: 'outline-color 120ms ease, background-color 120ms ease',
        '& .MuiChip-label': {
          px: 1.5,
          display: 'flex',
          alignItems: 'center'
        }
      }}
      label={
        <Stack direction="row" alignItems="center" spacing={0.75}>
          <Typography variant="body2" sx={{ fontWeight: selected ? 600 : 400 }}>
            {t('All Templates')}
          </Typography>
          <Typography
            variant="caption"
            color={selected ? 'inherit' : 'text.secondary'}
          >
            · {count}
          </Typography>
        </Stack>
      }
    />
  )
}
