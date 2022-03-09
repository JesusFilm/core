import { render, fireEvent } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import {
  EditorProvider,
  TreeBlock,
  ActiveFab,
  Typography
} from '@core/journeys/ui'
import { TypographyVariant } from '../../../../../__generated__/globalTypes'
import { TypographyFields } from '../../../../../__generated__/TypographyFields'
import { InlineEditWrapper } from '.'

describe('TypographyEdit', () => {
  const block: TreeBlock<TypographyFields> = {
    __typename: 'TypographyBlock',
    id: 'typography.id',
    parentBlockId: 'parent.id',
    parentOrder: 0,
    variant: TypographyVariant.body1,
    content: 'test content',
    color: null,
    align: null,
    children: []
  }
  const step: TreeBlock = {
    __typename: 'StepBlock',
    id: 'step.id',
    parentBlockId: null,
    parentOrder: 0,
    locked: true,
    nextBlockId: null,
    children: [block]
  }
  const props = {
    block,
    children: <Typography {...block} />
  }
  it('renders children by default', () => {
    const { getByText } = render(
      <MockedProvider>
        <EditorProvider>
          <InlineEditWrapper {...props} />
        </EditorProvider>
      </MockedProvider>
    )
    expect(getByText('test content')).toBeInTheDocument()
  })

  it('should edit typography on double click', async () => {
    const { getByRole, getByText } = render(
      <MockedProvider>
        <EditorProvider
          initialState={{
            steps: [step],
            activeFab: ActiveFab.Add
          }}
        >
          <InlineEditWrapper {...props} />
        </EditorProvider>
      </MockedProvider>
    )

    fireEvent.click(getByText('test content'))
    fireEvent.click(getByText('test content'))
    const input = getByRole('textbox')
    expect(input).toBeInTheDocument()
    // Check it doesn't deselected on click
    fireEvent.click(input)
    expect(input).toBeInTheDocument()
  })
})
