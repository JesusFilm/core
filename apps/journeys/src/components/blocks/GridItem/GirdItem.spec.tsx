import { render } from '../../../../test/testingLibrary'
import { GridItem } from '.'
import { TreeBlock } from '../../../libs/transformer/transformer'

describe('GridItemBlock', () => {
  const block: TreeBlock = {
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
