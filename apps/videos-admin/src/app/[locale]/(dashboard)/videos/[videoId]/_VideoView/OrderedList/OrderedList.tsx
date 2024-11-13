import { DndContext, DragEndEvent } from '@dnd-kit/core'
import { SortableContext } from '@dnd-kit/sortable'
import Stack from '@mui/material/Stack'
import { ReactElement, ReactNode } from 'react'

interface BaseItem {
  id: string
}

export interface OrderedListProps<T extends BaseItem> {
  onOrderUpdate: (e: DragEndEvent) => void
  items: T[]
  children: ReactNode
}

export function OrderedList<T extends BaseItem>({
  onOrderUpdate,
  items,
  children
}: OrderedListProps<T>): ReactElement {
  async function handleDragEnd(e: DragEndEvent): Promise<void> {
    await onOrderUpdate(e)
  }

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <SortableContext items={items}>
        <Stack gap={1}>{children}</Stack>
      </SortableContext>
    </DndContext>
  )
}
