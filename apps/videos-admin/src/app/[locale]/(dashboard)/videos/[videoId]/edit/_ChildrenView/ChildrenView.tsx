import { DndContext } from '@dnd-kit/core'
import { SortableContext } from '@dnd-kit/sortable'
import { Stack, Typography } from '@mui/material'
import { ReactElement } from 'react'

import { DraggableRow } from '../DraggableRow'

export function ChildrenView({ childVideos }): ReactElement {
  if (childVideos.length === 0) {
    return <Typography>No children to show</Typography>
  }

  return (
    <DndContext>
      <SortableContext items={childVideos}>
        <Stack gap={1} sx={{ height: '600px', overflowY: 'scroll' }}>
          {childVideos.map((child, idx) => (
            <DraggableRow
              id={child.id}
              key={child.id}
              label={child.title[0].value}
              idx={idx}
              count={childVideos.length}
              img={{
                src: child.images[0].mobileCinematicHigh,
                alt: child.imageAlt[0].value
              }}
            />
          ))}
        </Stack>
      </SortableContext>
    </DndContext>
  )
}
