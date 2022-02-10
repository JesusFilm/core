import { ReactElement } from 'react'
import { kebabCase } from 'lodash'
import MaterialGrid, { GridDirection } from '@mui/material/Grid'
import { TreeBlock } from '../..'
import { BlockRenderer, WrappersProps } from '../BlockRenderer'
import { GridContainerFields } from './__generated__/GridContainerFields'

interface GridContainerProps extends TreeBlock<GridContainerFields> {
  wrappers?: WrappersProps
}

export function GridContainer({
  spacing,
  direction,
  justifyContent,
  alignItems,
  children,
  wrappers
}: GridContainerProps): ReactElement {
  return (
    <MaterialGrid
      container
      spacing={spacing}
      direction={kebabCase(direction) as GridDirection}
      alignItems={kebabCase(alignItems)}
      justifyContent={kebabCase(justifyContent)}
    >
      {children?.map((block) => (
        <BlockRenderer block={block} wrappers={wrappers} key={block.id} />
      ))}
    </MaterialGrid>
  )
}
