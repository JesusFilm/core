import { render } from '../../../../test/testingLibrary'
import { Grid } from '.'
import { TreeBlock } from '../../../libs/transformer/transformer'
import {
  GridDirection,
  GridJustifyContent,
  GridAlignItems,
  GridSize,
  GridSpacing
} from '../../../../__generated__/globalTypes'

describe('GridBlock', () => {
  const block: TreeBlock = {
    __typename: 'GridBlock',
    id: 'grid',
    item: null,
    parentBlockId: null,
    container: {
      __typename: 'Container',
      spacing: GridSpacing._6,
      direction: GridDirection.row,
      justifyContent: GridJustifyContent.center,
      alignItems: GridAlignItems.center
    },
    children: [
      {
        __typename: 'GridBlock',
        id: 'griditem',
        parentBlockId: 'grid',
        item: {
          __typename: 'Item',
          lg: GridSize._6
        },
        container: null,
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
    const { getByText } = render(<Grid {...block} />)
    expect(getByText('How did we get here?')).toBeInTheDocument()
  })
})
