import { render } from '../../../../test/testingLibrary'
import { TreeBlock } from '../../../libs/transformer/transformer'
import {
  GridDirection,
  GridJustifyContent,
  GridAlignItems
} from '../../../../__generated__/globalTypes'
import { GridContainer } from '.'

describe('GridContainer', () => {
  const block: TreeBlock = {
    __typename: 'GridContainerBlock',
    id: 'gridContainer',
    parentBlockId: null,
    spacing: 6,
    direction: GridDirection.row,
    justifyContent: GridJustifyContent.center,
    alignItems: GridAlignItems.center,
    children: [
      {
        __typename: 'GridItemBlock',
        id: 'griditem',
        parentBlockId: 'gridContainer',
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
    ]
  }

  it('should render children', () => {
    const { getByText } = render(<GridContainer {...block} />)
    expect(getByText('How did we get here?')).toBeInTheDocument()
  })
})
