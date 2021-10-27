import { ReactElement } from 'react'
import { GetJourney_journey_blocks_GridBlock as GridBlock } from '../../../../__generated__/GetJourney'
import { TreeBlock } from '../../../libs/transformer/transformer'
import { Grid as MaterialGrid, GridDirection, GridSize } from '@mui/material'
import { BlockRenderer } from '../../BlockRenderer'

export function Grid({
  container,
  item,
  children
}: TreeBlock<GridBlock>): ReactElement {
  const isContainer = container !== null && container !== undefined
  const isItem = item !== null && item !== undefined

  const props = {
    ...(isContainer && {
      container: true,
      spacing: container?.spacing,
      direction: hyphenate(container?.direction) as GridDirection,
      alignItems: hyphenate(container?.alignItems) as GridDirection,
      justifyContent: hyphenate(container?.justifyContent) as GridDirection
    }),
    ...(isItem && {
      item: true,
      xl: item?.xl as GridSize,
      lg: item?.lg as GridSize,
      md: 12 as GridSize,
      sm: item?.sm as GridSize,
      xs: 12 as GridSize
    })
  }

  return (
    <MaterialGrid {...props}>
      {children?.map((block) => (
        <BlockRenderer {...block} key={block.id} />
      ))}
    </MaterialGrid>
  )
}

const hyphenate = (value): string | undefined => {
  if (value === undefined) {
    return undefined
  } else {
    return value.replace(
      /([A-Z])/g,
      (g: string[]): string => `-${g[0].toLowerCase()}`
    )
  }
}
