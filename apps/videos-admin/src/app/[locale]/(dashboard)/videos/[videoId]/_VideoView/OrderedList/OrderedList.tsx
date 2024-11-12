import { DndContext, DragEndEvent } from '@dnd-kit/core'
import { SortableContext } from '@dnd-kit/sortable'
import Stack from '@mui/material/Stack'
import { ReactElement, ReactNode } from 'react'

interface BaseItem {
  id: string
}

export interface OrderedListProps<T extends BaseItem> {
  onOrderUpdate: (input: { id: string; order: number }) => void
  items: T[]
  children: ReactNode
}

export function OrderedList<T extends BaseItem>({
  onOrderUpdate,
  items,
  children
}: OrderedListProps<T>): ReactElement {
  const handleDragEnd = async (e: DragEndEvent): Promise<void> => {
    if (e.over == null) return

    if (e.active.id !== e.over.id) {
      const newIndex = items.findIndex((item) => item.id === e.over?.id)

      await onOrderUpdate({ id: e.active.id as string, order: newIndex + 1 })
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
