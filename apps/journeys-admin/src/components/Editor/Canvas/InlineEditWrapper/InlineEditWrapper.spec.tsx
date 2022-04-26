import { render, fireEvent, waitFor } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import {
  EditorProvider,
  TreeBlock,
  ActiveFab,
  Button,
  RadioQuestion,
  SignUp,
  Typography
} from '@core/journeys/ui'
import { ButtonFields } from '../../../../../__generated__/ButtonFields'
import { RadioOptionFields } from '../../../../../__generated__/RadioOptionFields'
import { RadioQuestionFields } from '../../../../../__generated__/RadioQuestionFields'
import { SignUpFields } from '../../../../../__generated__/SignUpFields'
import { StepFields } from '../../../../../__generated__/StepFields'
import { TypographyVariant } from '../../../../../__generated__/globalTypes'
import { TypographyFields } from '../../../../../__generated__/TypographyFields'
import { SelectableWrapper } from '../SelectableWrapper'
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
    const { getByDisplayValue, getByText, getByTestId } = render(
      <MockedProvider>
        <EditorProvider
          initialState={{
            steps: [step(typographyBlock)],
            activeFab: ActiveFab.Add
          }}
        >
          <SelectableWrapper block={typographyBlock}>
            <InlineEditWrapper block={typographyBlock}>
              <Typography {...typographyBlock} />
            </InlineEditWrapper>
          </SelectableWrapper>
        </EditorProvider>
      </MockedProvider>
    )

    fireEvent.click(getByText('test content'))
    fireEvent.click(getByText('test content'))
    expect(getByTestId(`selected-${typographyBlock.id}`)).toHaveStyle({
      outline: '3px solid #C52D3A',
      zIndex: '1'
    })
    const input = getByDisplayValue('test content')
    expect(input).toBeInTheDocument()
    // Check it doesn't deselected on click
    fireEvent.click(input)
    expect(input).toBeInTheDocument()
  })

  it('should edit button label on double click', async () => {
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

    const { getByDisplayValue, getByText, getByTestId } = render(
      <MockedProvider>
        <EditorProvider
          initialState={{
            steps: [step(block)],
            activeFab: ActiveFab.Add
          }}
        >
          <SelectableWrapper block={block}>
            <InlineEditWrapper block={block}>
              <Button {...block} />
            </InlineEditWrapper>
          </SelectableWrapper>
        </EditorProvider>
      </MockedProvider>
    )

    fireEvent.click(getByText('test label'))
    fireEvent.click(getByText('test label'))
    expect(getByTestId(`selected-${block.id}`)).toHaveStyle({
      outline: '3px solid #C52D3A',
      zIndex: '1'
    })

    const input = getByDisplayValue('test label')
    expect(input).toBeInTheDocument()
  })

  it('should edit sign up button label on double click', async () => {
    const block: TreeBlock<SignUpFields> = {
      __typename: 'SignUpBlock',
      id: 'signUp.id',
      parentBlockId: 'parent.id',
      parentOrder: 0,
      submitLabel: 'test label',
      submitIconId: null,
      action: null,
      children: []
    }

    const { getByDisplayValue, getByText, getByTestId } = render(
      <MockedProvider>
        <EditorProvider
          initialState={{
            steps: [step(block)],
            activeFab: ActiveFab.Add
          }}
        >
          {' '}
          <SelectableWrapper block={block}>
            <InlineEditWrapper block={block}>
              <SignUp {...block} />
            </InlineEditWrapper>
          </SelectableWrapper>
        </EditorProvider>
      </MockedProvider>
    )

    fireEvent.click(getByText('test label'))
    fireEvent.click(getByText('test label'))
    expect(getByTestId(`selected-${block.id}`)).toHaveStyle({
      outline: '3px solid #C52D3A',
      zIndex: '1'
    })
    const input = getByDisplayValue('test label')
    await waitFor(() => expect(input).toBeInTheDocument())
  })

  it('should edit radio option label on double click', async () => {
    const option: TreeBlock<RadioOptionFields> = {
      __typename: 'RadioOptionBlock',
      parentBlockId: 'radioQuestion.id',
      parentOrder: 0,
      id: 'radioOption.id',
      label: 'option',
      action: null,
      children: []
    }

    const block: TreeBlock<RadioQuestionFields> = {
      __typename: 'RadioQuestionBlock',
      parentBlockId: 'card.id',
      parentOrder: 0,
      id: 'radioQuestion.id',
      label: 'heading',
      description: 'description',
      children: [option]
    }

    const { getByDisplayValue, getByText, getByTestId } = render(
      <MockedProvider>
        <EditorProvider
          initialState={{
            steps: [step(block)],
            activeFab: ActiveFab.Add
          }}
        >
          <SelectableWrapper block={block}>
            <InlineEditWrapper block={block}>
              <RadioQuestion
                {...block}
                wrappers={{
                  Wrapper: SelectableWrapper,
                  RadioOptionWrapper: InlineEditWrapper
                }}
              />
            </InlineEditWrapper>
          </SelectableWrapper>
        </EditorProvider>
      </MockedProvider>
    )

    // Select RadioQuestion
    fireEvent.click(getByText('option'))
    // Double click on option
    fireEvent.click(getByText('option'))
    fireEvent.click(getByText('option'))
    expect(getByTestId(`selected-${option.id}`)).toHaveStyle({
      outline: '3px solid #C52D3A',
      zIndex: '1'
    })
    const input = getByDisplayValue('option')
    await waitFor(() => expect(input).toBeInTheDocument())
  })
})
