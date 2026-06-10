import { useSortable } from '@dnd-kit/sortable'
import Box from '@mui/material/Box'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement } from 'react'

import DragIcon from '@core/shared/ui/icons/Drag'

import { GetAdminJourneys_journeys as Journey } from '../../../../__generated__/GetAdminJourneys'

import { MobileTemplateListRow } from './MobileTemplateListRow'

export interface SortableMobileTemplateListRowProps {
  journey: Journey
  /** Disables drag activation entirely (e.g. when a dialog is open or a
   * previous mutation is still in flight). */
  disabled: boolean
}

/**
 * Sortable wrapper around `MobileTemplateListRow`. `useSortable`'s
 * `listeners` and `attributes` are bound ONLY to the drag handle on the
 * right, leaving the rest of the row (image + content) tappable as a
 * navigation link.
 */
export function SortableMobileTemplateListRow({
  journey,
  disabled
}: SortableMobileTemplateListRowProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const {
    setNodeRef,
    setActivatorNodeRef,
    listeners,
    attributes,
    transform,
    isDragging
  } = useSortable({ id: journey.id, disabled })
  const style =
    transform != null
      ? {
          transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`
        }
      : undefined

  return (
    <Box
      ref={setNodeRef}
      style={style}
      sx={{
        opacity: isDragging ? 0.4 : 1
      }}
    >
      <MobileTemplateListRow
        journey={journey}
        dragHandleSlot={
          <Box
            ref={setActivatorNodeRef}
            {...listeners}
            {...attributes}
            role="button"
            aria-label={t('Drag handle for {{title}}', {
              title: journey.title
            })}
            tabIndex={disabled ? -1 : 0}
            sx={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: disabled ? 'default' : isDragging ? 'grabbing' : 'grab',
              touchAction: 'none',
              color: 'text.secondary',
              // Visible focus ring for keyboard users — useSortable supports
              // keyboard activation via its sensor.
              '&:focus-visible': {
                outline: '2px solid',
                outlineColor: 'primary.main',
                outlineOffset: -2
              }
            }}
          >
            <DragIcon />
          </Box>
        }
      />
    </Box>
  )
}
