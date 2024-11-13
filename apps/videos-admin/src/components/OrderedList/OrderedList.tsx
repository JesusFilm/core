import { DndContext, DragEndEvent } from '@dnd-kit/core'
import { SortableContext } from '@dnd-kit/sortable'
import Stack from '@mui/material/Stack'
import { ReactElement, ReactNode } from 'react'

interface BaseItem {
  id: string
}

export interface OrderedListProps<T extends BaseItem> {
  onOrderUpdate: (update: {
    id: string
    newOrder: number
    oldOrder: number
  }) => void
  items: T[]
  children: ReactNode
}

export function OrderedList<T extends BaseItem>({
  onOrderUpdate,
  items,
  children
}: OrderedListProps<T>): ReactElement {
  const handleDragEnd = async (e: DragEndEvent): Promise<void> => {
    if (e.over != null && e.active.id !== e.over.id) {
      const newIndex = items.findIndex(({ id }) => id === e.over?.id)
      const oldIndex = items.findIndex(({ id }) => id === e.active.id)

      await onOrderUpdate({
        id: e.active.id as string,
        newOrder: newIndex,
        oldOrder: oldIndex
      })
    }
  }

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <SortableContext items={items}>
        <Stack gap={1}>{children}</Stack>
      </SortableContext>
    </DndContext>
  )
}
