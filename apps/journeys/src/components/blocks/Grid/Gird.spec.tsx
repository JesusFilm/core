import { render } from '../../../../test/testingLibrary'
import { Grid } from '.'
import { TreeBlock } from '../../../libs/transformer/transformer'
import { GridType, ColumnSize } from '../../../../__generated__/globalTypes'

describe('GridBlock', () => {
  const block: TreeBlock = {
    __typename: 'GridBlock',
    id: 'grid',
    parentBlockId: null,
    md: ColumnSize._12,
    type: GridType.container,
    children: [
      {
        __typename: 'GridBlock',
        id: 'griditem',
        parentBlockId: 'grid',
        md: ColumnSize._6,
        type: GridType.item,
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
