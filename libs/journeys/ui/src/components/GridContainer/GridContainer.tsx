import { ReactElement } from 'react'
import { kebabCase } from 'lodash'
import { Grid as MaterialGrid, GridDirection } from '@mui/material'
import { TreeBlock } from '../..'
import { BlockRenderer } from '../BlockRenderer'
import { GridContainerFields } from './__generated__/GridContainerFields'

export function GridContainer({
  spacing,
  direction,
  justifyContent,
  alignItems,
  children
}: TreeBlock<GridContainerFields>): ReactElement {
  return (
    <MaterialGrid
      container
      spacing={spacing}
      direction={kebabCase(direction) as GridDirection}
      alignItems={kebabCase(alignItems)}
      justifyContent={kebabCase(justifyContent)}
    >
      {children?.map((block) => (
        <BlockRenderer {...block} key={block.id} />
      ))}
    </MaterialGrid>
  )
}
