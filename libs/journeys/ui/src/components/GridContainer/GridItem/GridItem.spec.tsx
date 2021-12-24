import { render } from '@testing-library/react'
import { TreeBlock } from '../../..'
import { GridItemFields } from './__generated__/GridItemFields'
import { GridItem } from '.'

describe('GridItemBlock', () => {
  const block: TreeBlock<GridItemFields> = {
    id: 'griditem',
    parentBlockId: 'gridItemContainer',
    __typename: 'GridItemBlock',
    xl: 6,
    lg: 6,
    sm: 6,
    children: [
      {
        id: 'typographyBlockId',
        __typename: 'TypographyBlock',
        parentBlockId: 'griditem',
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
