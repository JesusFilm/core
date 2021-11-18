import { ReactElement } from 'react'
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
