import {
  Active,
  DndContext,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  closestCenter
} from '@dnd-kit/core'
import { SortableContext } from '@dnd-kit/sortable'
import { ReactElement, ReactNode, useMemo, useState } from 'react'

import { BlockRenderer } from '@core/journeys/ui/BlockRenderer'
import { useCommand } from '@core/journeys/ui/CommandProvider'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import { searchBlocks } from '@core/journeys/ui/searchBlocks'

import {
  getNewParentOrder,
  useBlockOrderUpdateMutation
} from '../../../../../../libs/useBlockOrderUpdateMutation'

interface DropAreaProps {
  children: ReactNode
}

export function DropArea({ children }: DropAreaProps): ReactElement {
  const [blockOrderUpdate] = useBlockOrderUpdateMutation()
  const [active, setActive] = useState<Active | null>(null)

  const {
    state: { selectedStep }
  } = useEditor()
  const { add } = useCommand()

  const activeItem = useMemo(
    () =>
      selectedStep?.children[0].children.find((item) => item.id === active?.id),
    [active?.id, selectedStep?.children]
  )

  const items =
    selectedStep?.children[0].children.filter(
      (block) =>
        block != null &&
        block.__typename !== 'StepBlock' &&
        block.__typename !== 'CardBlock' &&
        block.__typename !== 'IconBlock' &&
        block.parentOrder !== null
    ) ?? []

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
  }

  return (
    <DndContext
      onDragEnd={handleDragEnd}
      onDragStart={handleDragStart}
      collisionDetection={closestCenter}
    >
      <SortableContext items={itemIds}>{children}</SortableContext>
      <DragOverlay dropAnimation={null}>
        {activeItem != null ? <BlockRenderer block={activeItem} /> : null}
      </DragOverlay>
    </DndContext>
  )
}
