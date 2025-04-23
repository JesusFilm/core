import {
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy
} from '@dnd-kit/sortable'
import List from '@mui/material/List'
import { ReactElement, ReactNode } from 'react'

export interface BaseItem {
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

  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  )

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <SortableContext items={items} strategy={verticalListSortingStrategy}>
        <List sx={{ gap: 1, px: 0 }}>{children}</List>
      </SortableContext>
    </DndContext>
  )
}
