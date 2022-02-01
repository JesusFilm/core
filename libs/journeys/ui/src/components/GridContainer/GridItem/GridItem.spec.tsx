import { render } from '@testing-library/react'
import { TreeBlock } from '../../..'
import { GridItemFields } from './__generated__/GridItemFields'
import { GridItem } from '.'

describe('GridItemBlock', () => {
  const block: TreeBlock<GridItemFields> = {
    __typename: 'GridItemBlock',
    id: 'griditem',
    parentBlockId: 'gridItemContainer',
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

  it('should render children', () => {
    const { getByText } = render(<GridItem {...block} />)
    expect(getByText('How did we get here?')).toBeInTheDocument()
  })
})
