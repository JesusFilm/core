import {
  Active,
  DndContext,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  MouseSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors
} from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import Box from '@mui/material/Box'
import { ReactElement, ReactNode, useEffect, useMemo, useState } from 'react'

import { TreeBlock } from '@core/journeys/ui/block/TreeBlock'
import { BlockRenderer } from '@core/journeys/ui/BlockRenderer'
import { useCommand } from '@core/journeys/ui/CommandProvider'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import { searchBlocks } from '@core/journeys/ui/searchBlocks'

import { BlockFields } from '../../../../../../../__generated__/BlockFields'
import {
  getNewParentOrder,
  useBlockOrderUpdateMutation
} from '../../../../../../libs/useBlockOrderUpdateMutation'

interface DragDropWrapperProps {
  children: ReactNode
}

export function DragDropWrapper({
  children
}: DragDropWrapperProps): ReactElement {
  const [blockOrderUpdate] = useBlockOrderUpdateMutation()
  const [active, setActive] = useState<Active | null>(null)
  const [items, setItems] = useState<TreeBlock<BlockFields>[]>([])
  const {
    state: { selectedStep }
  } = useEditor()
  const { add } = useCommand()
  const activeItem = useMemo(
    () =>
      selectedStep?.children[0].children.find((item) => item.id === active?.id),
    [active?.id, selectedStep?.children]
  )

  useEffect(() => {
    setItems(
      selectedStep?.children[0].children.filter(
        (block) =>
          block != null &&
          block.__typename !== 'StepBlock' &&
          block.__typename !== 'CardBlock' &&
          block.__typename !== 'IconBlock' &&
          block.__typename !== 'RadioOptionBlock' &&
          block.parentOrder !== null
      ) ?? []
    )
  }, [selectedStep?.children])

  const mouseSensor = useSensor(MouseSensor)
  const touchSensor = useSensor(TouchSensor)

  const activeSensors = useSensors(mouseSensor, touchSensor)

  const itemIds = items.map((block) => block.id)

  function handleMoveBlock(move: number, id: string): void {
    const block = items.find((block) => block.id === id)

    const parentBlock =
      block?.parentBlockId != null && selectedStep != null
        ? searchBlocks(selectedStep.children, block.parentBlockId)
        : selectedStep

    if (block?.parentOrder == null || parentBlock == null) return
    const parentOrder = block.parentOrder + move

    add({
      parameters: {
        execute: { parentOrder },
        undo: { parentOrder: block.parentOrder }
      },
      execute({ parentOrder }) {
        void blockOrderUpdate({
          variables: {
            id: block.id,
            parentOrder
          },
          optimisticResponse: {
            blockOrderUpdate: getNewParentOrder(
              [parentBlock],
              block,
              parentOrder
            )
          }
        })
      }
    })
  }

  function handleDragStart(e: DragStartEvent): void {
    const { active } = e
    setActive(active)
  }

  function handleDragEnd(e: DragOverEvent): void {
    const { over, active } = e
    if (over != null && active.id !== over.id) {
      const moveIndex =
        itemIds.indexOf(over.id as string) -
        itemIds.indexOf(active.id as string)
      handleMoveBlock(moveIndex, active.id as string)
    }
    setActive(null)
  }

  return (
    <DndContext
      onDragEnd={handleDragEnd}
      onDragStart={handleDragStart}
      collisionDetection={closestCenter}
      sensors={activeSensors}
    >
      <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
        {children}
      </SortableContext>
      {activeItem != null && (
        <DragOverlay dropAnimation={null}>
          <Box
            sx={{
              ml: -8,
              pl: 8,
              transform:
                activeItem.__typename === 'ButtonBlock'
                  ? 'translateY(-20px)'
                  : activeItem.__typename === 'RadioOptionBlock'
                    ? 'translateY(-4px) translateX(-4px)'
                    : 'auto',
              cursor: 'grabbing',
              borderRadius:
                activeItem.__typename === 'RadioOptionBlock' ? '10px' : 'auto'
            }}
          >
            <BlockRenderer block={activeItem} />
          </Box>
        </DragOverlay>
      )}
    </DndContext>
  )
}
