import { ReactElement } from 'react'
import { GetJourney_journey_blocks_GridBlock as GridBlock } from '../../../../__generated__/GetJourney'
import { TreeBlock } from '../../../libs/transformer/transformer'
import { Grid as MaterialGrid, GridSize } from '@mui/material'
import { BlockRenderer } from '../../BlockRenderer'
import { GridType } from '../../../../__generated__/globalTypes'

export function Grid({
  md,
  type,
  children
}: TreeBlock<GridBlock>): ReactElement {
  const columnSize = md === null ? 12 : (parseInt(md.split('_')[1]) as GridSize)
  const gridType = type === null ? GridType.container : type

  return (
    <MaterialGrid
      container={gridType.includes('container')}
      item={gridType.includes('item')}
      md={gridType.includes('item') ? columnSize : undefined}
      sm={gridType.includes('item') ? 12 : undefined}
      xs={gridType.includes('item') ? 12 : undefined}
      spacing={gridType.includes('container') ? 3 : undefined}
    >
      {children?.map((block) => (
        <BlockRenderer {...block} key={block.id} />
      ))}
    </MaterialGrid>
  )
}
