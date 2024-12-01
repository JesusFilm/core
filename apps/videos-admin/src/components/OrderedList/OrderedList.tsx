import {
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core'
import { SortableContext, sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import Stack from '@mui/material/Stack'
import { ReactElement, ReactNode } from 'react'

import { useEdit } from '../../app/[locale]/(dashboard)/videos/[videoId]/_EditProvider'

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
  const {
    state: { isEdit }
  } = useEdit()

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
      <SortableContext items={items} disabled={!isEdit}>
        <Stack gap={1}>{children}</Stack>
      </SortableContext>
    </DndContext>
  )
}
