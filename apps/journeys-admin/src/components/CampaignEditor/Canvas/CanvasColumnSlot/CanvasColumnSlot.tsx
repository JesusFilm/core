import { useDraggable, useDroppable } from '@dnd-kit/core'
import Box from '@mui/material/Box'
import ButtonBase from '@mui/material/ButtonBase'
import { useTranslation } from 'next-i18next/pages'
import { MouseEvent, ReactElement, useCallback } from 'react'

import { blockLabel } from '../../blockLabel'
import { useCampaignEditor } from '../../CampaignEditorProvider'
import { CanvasDragHandle } from '../CanvasDragHandle'
import { CanvasBlock, CanvasSection } from '../CanvasSection'
import { EditorNote } from '../EditorNote'
import { ADMIN_PRIMARY, HOVER_OUTLINE_SX } from '../hoverOutline'
import { SelectionBadge } from '../SelectionBadge'

interface CanvasColumnSlotProps {
  slot: CanvasBlock
}

/**
 * One Column Slot on the canvas: the section it holds, or a placeholder when
 * empty (clicking it opens the Add Panel, preset to the slot, offering the
 * types that fit). Clicking the slot around a section selects that section.
 * The slot is its own
 * drop target and, by its handle, a drag source: dropping it on the other
 * slot of the same Columns section swaps the two. Only slots of one Columns
 * section ever collide with each other.
 */
export function CanvasColumnSlot({
  slot
}: CanvasColumnSlotProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { selection, selectBlock, dispatch } = useCampaignEditor()
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
    selectBlock(section?.id ?? slot.id)
  }

  function handlePlaceholderClick(event: MouseEvent<HTMLElement>): void {
    event.stopPropagation()
    selectBlock(slot.id)
    if (slot.pageId == null) return
    dispatch({
      type: 'OpenAddPanelAction',
      preset: { pageId: slot.pageId, parentOrder: 0, parentBlockId: slot.id }
    })
  }

  return (
    <Box
      ref={setSlotRef}
      id={slot.id}
      data-testid={`CanvasColumnSlot-${slot.id}`}
      data-selected={slotSelected}
      data-hoverable
      onClick={handleClick}
      sx={{
        position: 'relative',
        minHeight: 96,
        cursor: 'pointer',
        opacity: isDragging ? 0.6 : 1,
        ...HOVER_OUTLINE_SX,
        outline: dropTarget
          ? `3px solid ${ADMIN_PRIMARY.main}`
          : slotSelected
            ? `2px solid ${ADMIN_PRIMARY.main}`
            : 'none',
        outlineOffset: -2
      }}
    >
      <SelectionBadge
        id={slot.id}
        label={blockLabel(t, slot.__typename)}
        selected={slotSelected}
      />
      <CanvasDragHandle
        activatorRef={setActivatorNodeRef}
        listeners={listeners}
        attributes={attributes}
        label={t('Drag column')}
        testId={`CanvasColumnDragHandle-${slot.id}`}
        dragging={isDragging}
        visible={withinSelection}
        position={{ top: 8, right: 8, zIndex: 2 }}
        stopClick
      />
      {section != null ? (
        <CanvasSection block={section} inSlot />
      ) : (
        <ButtonBase
          data-testid={`CanvasEmptyColumn-${slot.id}`}
          aria-label={t('Add to column')}
          onClick={handlePlaceholderClick}
          sx={{
            width: '100%',
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
          <EditorNote>{t('Empty column')}</EditorNote>
        </ButtonBase>
      )}
    </Box>
  )
}
