import { render, fireEvent } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import {
  EditorProvider,
  TreeBlock,
  ActiveFab,
  Button,
  Typography
} from '@core/journeys/ui'
import { ButtonFields } from '../../../../../__generated__/ButtonFields'
import { StepFields } from '../../../../../__generated__/StepFields'
import { TypographyVariant } from '../../../../../__generated__/globalTypes'
import { TypographyFields } from '../../../../../__generated__/TypographyFields'
import { InlineEditWrapper } from '.'

describe('InlineEditWrapper', () => {
  const typographyBlock: TreeBlock<TypographyFields> = {
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

  const step = (block: TreeBlock): TreeBlock<StepFields> => {
    return {
      __typename: 'StepBlock',
      id: 'step.id',
      parentBlockId: null,
      parentOrder: 0,
      locked: true,
      nextBlockId: null,
      children: [block]
    }
  }

  it('renders children by default', () => {
    const { getByText } = render(
      <MockedProvider>
        <EditorProvider>
          <InlineEditWrapper block={typographyBlock}>
            <Typography {...typographyBlock} />
          </InlineEditWrapper>
        </EditorProvider>
      </MockedProvider>
    )
    expect(getByText('test content')).toBeInTheDocument()
  })

  it('should edit typography on double click', async () => {
    const { getByDisplayValue, getByText } = render(
      <MockedProvider>
        <EditorProvider
          initialState={{
            steps: [step(typographyBlock)],
            activeFab: ActiveFab.Add
          }}
        >
          <InlineEditWrapper block={typographyBlock}>
            <Typography {...typographyBlock} />
          </InlineEditWrapper>
        </EditorProvider>
      </MockedProvider>
    )

    fireEvent.click(getByText('test content'))
    fireEvent.click(getByText('test content'))
    const input = getByDisplayValue('test content')
    expect(input).toBeInTheDocument()
    // Check it doesn't deselected on click
    fireEvent.click(input)
    expect(input).toBeInTheDocument()
  })

  it('should edit button on double click', async () => {
    const block: TreeBlock<ButtonFields> = {
      __typename: 'ButtonBlock',
      id: 'button.id',
      parentBlockId: 'parent.id',
      parentOrder: 0,
      label: 'test label',
      buttonVariant: null,
      buttonColor: null,
      size: null,
      startIconId: null,
      endIconId: null,
      action: null,
      children: []
    }

    const { getByDisplayValue, getByText } = render(
      <MockedProvider>
        <EditorProvider
          initialState={{
            steps: [step(block)],
            activeFab: ActiveFab.Add
          }}
        >
          <InlineEditWrapper block={block}>
            <Button {...block} />
          </InlineEditWrapper>
        </EditorProvider>
      </MockedProvider>
    )

    fireEvent.click(getByText('test label'))
    fireEvent.click(getByText('test label'))
    const input = getByDisplayValue('test label')
    expect(input).toBeInTheDocument()
    fireEvent.click(input)
    expect(input).toBeInTheDocument()
  })
})
