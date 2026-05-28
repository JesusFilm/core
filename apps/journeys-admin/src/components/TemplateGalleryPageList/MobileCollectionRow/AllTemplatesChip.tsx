import { useDroppable } from '@dnd-kit/core'
import ButtonBase from '@mui/material/ButtonBase'
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

/**
 * "All Templates" filter card. Matches the collection chips' card height and
 * shape (no image — it represents every template), with a title and a
 * template-count subtext. Doubles as the unsectioned drop target (drop here to
 * ungroup a template).
 */
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
  const active = selected || isOver

  return (
    <ButtonBase
      data-testid="AllTemplatesChip"
      ref={setNodeRef}
      onClick={onSelect}
      aria-pressed={selected}
      aria-label={t('All Templates')}
      sx={{
        flexShrink: 0,
        // Match the collection chips' footprint (enlarged on desktop) so the
        // row stays uniform.
        height: { xs: 72, md: 144 },
        width: { xs: 250, md: 400 },
        px: 2,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        borderRadius: 2,
        border: 1,
        borderColor: active ? 'primary.main' : 'grey.400',
        backgroundColor: 'background.paper',
        outline: isOver ? '2px solid' : 'none',
        outlineColor: 'primary.dark',
        outlineOffset: 2,
        transition: 'border-color 120ms ease, outline-color 120ms ease'
      }}
    >
      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
        {t('All Templates')}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {t('{{count}} templates', {
          count,
          defaultValue_one: '{{count}} template',
          defaultValue_other: '{{count}} templates'
        })}
      </Typography>
    </ButtonBase>
  )
}
