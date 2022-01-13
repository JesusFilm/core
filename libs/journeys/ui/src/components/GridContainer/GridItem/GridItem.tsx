import { ReactElement } from 'react'
import MaterialGrid, { GridSize } from '@mui/material/Grid'
import { TreeBlock } from '../../..'
import { BlockRenderer } from '../../BlockRenderer'
import { GridItemFields } from './__generated__/GridItemFields'

export function GridItem({
  xl,
  lg,
  sm,
  children
}: TreeBlock<GridItemFields>): ReactElement {
  return (
    <MaterialGrid
      item
      xl={xl as GridSize}
      lg={lg as GridSize}
      md={12 as GridSize}
      sm={sm as GridSize}
      xs={12 as GridSize}
    >
      {children?.map((block) => (
        <BlockRenderer {...block} key={block.id} />
      ))}
    </MaterialGrid>
  )
}
