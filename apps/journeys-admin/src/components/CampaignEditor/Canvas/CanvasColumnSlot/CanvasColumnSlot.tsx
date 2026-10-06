import { useDraggable, useDroppable } from '@dnd-kit/core'
import Box from '@mui/material/Box'
import { SimplePaletteColorOptions } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next/pages'
import { MouseEvent, ReactElement, useCallback } from 'react'

import DragIcon from '@core/shared/ui/icons/Drag'
import { adminTheme } from '@core/shared/ui/themes/journeysAdmin/theme'

import { GetCampaign_campaign_theme as CampaignTheme } from '../../../../../__generated__/GetCampaign'
import { useCampaignEditor } from '../../CampaignEditorProvider'
import { CanvasBlock, CanvasSection } from '../CanvasSection'

interface CanvasColumnSlotProps {
  slot: CanvasBlock
  theme: CampaignTheme
}

const adminPrimary = adminTheme.palette.primary as SimplePaletteColorOptions

/**
 * One Column Slot on the canvas: the section it holds, or a placeholder when
 * empty (the bottom bar then offers the type picker). The slot is its own
 * drop target and, by its handle, a drag source: dropping it on the other
 * slot of the same Columns section swaps the two. Only slots of one Columns
 * section ever collide with each other.
 */
export function CanvasColumnSlot({
  slot,
  theme
}: CanvasColumnSlotProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { selection, selectBlock } = useCampaignEditor()
  const section = slot.children[0]
  const dragData = { slot: true, columnsId: slot.parentBlockId }
  const slotSelected = selection.block?.id === slot.id
  const withinSelection =
    slotSelected ||
    (section != null && selection.block?.id === section.id) ||
    (section != null && selection.host?.id === section.id)
  const { setNodeRef: setDroppableRef, isOver } = useDroppable({
    id: slot.id,
    data: dragData
  })
  const {
    setNodeRef: setDraggableRef,
    setActivatorNodeRef,
    listeners,
    attributes,
    isDragging,
    active
  } = useDraggable({ id: slot.id, data: dragData })
  const setSlotRef = useCallback(
    (node: HTMLElement | null) => {
      setDroppableRef(node)
      setDraggableRef(node)
    },
    [setDroppableRef, setDraggableRef]
  )
  const dropTarget = isOver && active != null && active.id !== slot.id

  function handleClick(event: MouseEvent<HTMLElement>): void {
    event.stopPropagation()
    selectBlock(slot.id)
  }

  return (
    <Box
      ref={setSlotRef}
      data-testid={`CanvasColumnSlot-${slot.id}`}
      data-selected={slotSelected}
      onClick={handleClick}
      sx={{
        position: 'relative',
        minHeight: 96,
        cursor: 'pointer',
        opacity: isDragging ? 0.6 : 1,
        outline: dropTarget
          ? `3px solid ${adminPrimary.main}`
          : slotSelected
            ? `2px solid ${adminPrimary.main}`
            : 'none',
        outlineOffset: -2
      }}
    >
      <Box
        ref={setActivatorNodeRef}
        {...listeners}
        {...attributes}
        aria-label={t('Drag column')}
        data-testid={`CanvasColumnDragHandle-${slot.id}`}
        onClick={(event: MouseEvent<HTMLElement>) => event.stopPropagation()}
        sx={{
          position: 'absolute',
          top: 8,
          right: 8,
          zIndex: 2,
          display: 'flex',
          p: 0.5,
          borderRadius: 1,
          bgcolor: 'background.paper',
          color: adminPrimary.main,
          boxShadow: 1,
          cursor: isDragging ? 'grabbing' : 'grab',
          touchAction: 'none',
          opacity: withinSelection ? 1 : 0,
          '[data-testid^="CanvasColumnSlot-"]:hover > &, &:focus-visible': {
            opacity: 1
          }
        }}
      >
        <DragIcon fontSize="small" />
      </Box>
      {section != null ? (
        <CanvasSection block={section} theme={theme} inSlot />
      ) : (
        <Box
          data-testid={`CanvasEmptyColumn-${slot.id}`}
          sx={{
            height: '100%',
            minHeight: 96,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: 1,
            borderStyle: 'dashed',
            borderColor: 'divider',
            borderRadius: 1
          }}
        >
          <Typography variant="body2" sx={{ opacity: 0.6 }}>
            {t('Empty column')}
          </Typography>
        </Box>
      )}
    </Box>
  )
}
