import { ReactElement } from 'react'
import MaterialGrid, { GridSize } from '@mui/material/Grid'
import { TreeBlock } from '../../..'
import { BlockRenderer, WrappersProps } from '../../BlockRenderer'
import { GridItemFields } from './__generated__/GridItemFields'

interface GridItemProps extends TreeBlock<GridItemFields> {
  wrappers?: WrappersProps
}

export function GridItem({
  xl,
  lg,
  sm,
  children,
  wrappers
}: GridItemProps): ReactElement {
  return (
    <MaterialGrid
      item
      xl={xl as GridSize}
      lg={lg as GridSize}
      md={12 as GridSize}
      sm={sm as GridSize}
      xs={12 as GridSize}
      sx={{
        '& > *': {
          '&:last-child': {
            marginBottom: '0px'
          }
        },
        mb: 4
      }}
    >
      {children?.map((block) => (
        <BlockRenderer block={block} wrappers={wrappers} key={block.id} />
      ))}
    </MaterialGrid>
  )
}
