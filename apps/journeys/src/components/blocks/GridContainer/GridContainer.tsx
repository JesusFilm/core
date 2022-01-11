import { ReactElement } from 'react'
import MaterialGrid, { GridDirection } from '@mui/material/Grid'
import { GetJourney_journey_blocks_GridContainerBlock as GridContainerBlock } from '../../../../__generated__/GetJourney'
import { TreeBlock } from '../../../libs/transformer/transformer'
import { BlockRenderer } from '../../BlockRenderer'

export function GridContainer({
  spacing,
  direction,
  justifyContent,
  alignItems,
  children
}: TreeBlock<GridContainerBlock>): ReactElement {
  return (
    <MaterialGrid
      container
      spacing={spacing}
      direction={hyphenate(direction) as GridDirection}
      alignItems={hyphenate(alignItems)}
      justifyContent={hyphenate(justifyContent)}
    >
      {children?.map((block) => (
        <BlockRenderer {...block} key={block.id} />
      ))}
    </MaterialGrid>
  )
}

const hyphenate = (value): string =>
  value.replace(/([A-Z])/g, (g: string[]): string => `-${g[0].toLowerCase()}`)
