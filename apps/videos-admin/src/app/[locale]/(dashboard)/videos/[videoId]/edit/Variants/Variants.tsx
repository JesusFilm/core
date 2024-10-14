import { DndContext } from '@dnd-kit/core'
import { SortableContext } from '@dnd-kit/sortable'
import { Box, Stack } from '@mui/material'
import { ReactElement } from 'react'

import { DraggableRow } from '../DraggableRow'

export function Variants({ variants }): ReactElement {
  console.log(variants)
  const items = variants.slice(0, 500)
  return (
    <Box sx={{ height: '600px', overflowY: 'scroll' }}>
      <DndContext>
        <SortableContext items={items}>
          <Stack gap={1}>
            {items.map(({ id, slug }, idx) => (
              <DraggableRow
                key={id}
                id={id}
                label={slug}
                idx={idx}
                count={items.length}
              />
            ))}
          </Stack>
        </SortableContext>
      </DndContext>
    </Box>
  )
}
