import { ReactElement } from 'react'
import MaterialGrid, { GridSize } from '@mui/material/Grid'
import { GetJourney_journey_blocks_GridItemBlock as GridItemBlock } from '../../../../__generated__/GetJourney'
import { TreeBlock } from '../../../libs/transformer/transformer'
import { BlockRenderer } from '../../BlockRenderer'

export function GridItem({
  xl,
  lg,
  sm,
  children
}: TreeBlock<GridItemBlock>): ReactElement {
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
