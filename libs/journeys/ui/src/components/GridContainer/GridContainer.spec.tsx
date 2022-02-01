import { render } from '@testing-library/react'
import { TreeBlock } from '../..'
import {
  GridDirection,
  GridJustifyContent,
  GridAlignItems
} from '../../../__generated__/globalTypes'
import { GridContainerFields } from './__generated__/GridContainerFields'
import { GridContainer } from '.'

describe('GridContainer', () => {
  const block: TreeBlock<GridContainerFields> = {
    __typename: 'GridContainerBlock',
    id: 'gridContainer',
    parentBlockId: null,
    parentOrder: 0,
    spacing: 6,
    direction: GridDirection.row,
    justifyContent: GridJustifyContent.center,
    alignItems: GridAlignItems.center,
    children: [
      {
        __typename: 'GridItemBlock',
        id: 'griditem',
        parentBlockId: 'gridContainer',
        parentOrder: 0,
        xl: 6,
        lg: 6,
        sm: 6,
        children: [
          {
            id: 'typographyBlockId',
            __typename: 'TypographyBlock',
            parentBlockId: 'griditem',
            parentOrder: 0,
            align: null,
            color: null,
            content: 'How did we get here?',
            variant: null,
            children: []
          }
        ]
      }
    ]
  }

  it('should render children', () => {
    const { getByText } = render(<GridContainer {...block} />)
    expect(getByText('How did we get here?')).toBeInTheDocument()
  })
})
