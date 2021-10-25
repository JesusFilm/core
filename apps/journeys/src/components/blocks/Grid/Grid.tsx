import { ReactElement } from 'react'
import { GetJourney_journey_blocks_GridBlock as GridBlock } from '../../../../__generated__/GetJourney'
import { TreeBlock } from '../../../libs/transformer/transformer'
import { Grid as MaterialGrid, GridSize, GridDirection } from '@mui/material'
import { BlockRenderer } from '../../BlockRenderer'

export function Grid({
  container,
  item,
  children
}: TreeBlock<GridBlock>): ReactElement {
  const isContainer = container !== null && container !== undefined
  const isItem = item !== null && item !== undefined

  return (
    <MaterialGrid
      container={isContainer}
      item={isItem}
      xl={isItem && (item?.lg.replace('_', '') as GridSize)}
      lg={isItem && (item?.lg.replace('_', '') as GridSize)}
      md={isItem && 12}
      sm={isItem && (item?.lg.replace('_', '') as GridSize)}
      xs={isItem && 12}
      spacing={isContainer ? container?.spacing.replace('_', '') : undefined}
      direction={container?.direction.replace('_', '-') as GridDirection}
      alignItems={container?.alignItems.replace('_', '-')}
      justifyContent={container?.justifyContent.replace('_', '-')}
    >
      {children?.map((block) => (
        <BlockRenderer {...block} key={block.id} />
      ))}
    </MaterialGrid>
  )
}
