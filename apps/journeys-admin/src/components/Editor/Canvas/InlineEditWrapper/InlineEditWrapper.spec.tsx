import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import type { TreeBlock } from '@core/journeys/ui/block'
import { Button } from '@core/journeys/ui/Button'
import { ActiveFab, EditorProvider } from '@core/journeys/ui/EditorProvider'
import { RadioQuestion } from '@core/journeys/ui/RadioQuestion'
import { SignUp } from '@core/journeys/ui/SignUp'
import { TextResponse } from '@core/journeys/ui/TextResponse'
import { Typography } from '@core/journeys/ui/Typography'

import { ButtonFields } from '../../../../../__generated__/ButtonFields'
import { TypographyVariant } from '../../../../../__generated__/globalTypes'
import { RadioOptionFields } from '../../../../../__generated__/RadioOptionFields'
import { RadioQuestionFields } from '../../../../../__generated__/RadioQuestionFields'
import { SignUpFields } from '../../../../../__generated__/SignUpFields'
import { StepFields } from '../../../../../__generated__/StepFields'
import { TextResponseFields } from '../../../../../__generated__/TextResponseFields'
import { TypographyFields } from '../../../../../__generated__/TypographyFields'
import { SelectableWrapper } from '../SelectableWrapper'

import { InlineEditWrapper } from '.'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => true
}))

jest.mock('react-i18next', () => ({
  __esModule: true,
  useTranslation: () => {
    return {
      t: (str: string) => str
    }
  }
}))

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
    expect(getByTestId(`SelectableWrapper-${typographyBlock.id}`)).toHaveStyle({
      outline: '2px solid #C52D3A',
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
    expect(getByTestId(`SelectableWrapper-${block.id}`)).toHaveStyle({
      outline: '2px solid #C52D3A',
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
        <SnackbarProvider>
          <EditorProvider
            initialState={{
              steps: [step(block)],
              activeFab: ActiveFab.Add
            }}
          >
            <SelectableWrapper block={block}>
              <InlineEditWrapper block={block}>
                <SignUp {...block} />
              </InlineEditWrapper>
            </SelectableWrapper>
          </EditorProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    fireEvent.click(getByText('test label'))
    fireEvent.click(getByText('test label'))
    expect(getByTestId(`SelectableWrapper-${block.id}`)).toHaveStyle({
      outline: '2px solid #C52D3A',
      zIndex: '1'
    })
    const input = getByDisplayValue('test label')
    await waitFor(() => expect(input).toBeInTheDocument())
  })

  it('should edit text response button label on double click', async () => {
    const block: TreeBlock<TextResponseFields> = {
      __typename: 'TextResponseBlock',
      id: 'textResponse.id',
      parentBlockId: 'parent.id',
      parentOrder: 0,
      label: 'Your answer here',
      hint: null,
      minRows: null,
      submitLabel: 'test label',
      submitIconId: null,
      action: null,
      children: []
    }

    const { getByDisplayValue, getByText, getByTestId } = render(
      <MockedProvider>
        <SnackbarProvider>
          <EditorProvider
            initialState={{
              steps: [step(block)],
              activeFab: ActiveFab.Add
            }}
          >
            <SelectableWrapper block={block}>
              <InlineEditWrapper block={block}>
                <TextResponse {...block} />
              </InlineEditWrapper>
            </SelectableWrapper>
          </EditorProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    fireEvent.click(getByText('test label'))
    fireEvent.click(getByText('test label'))
    expect(getByTestId(`SelectableWrapper-${block.id}`)).toHaveStyle({
      outline: '2px solid #C52D3A',
      zIndex: '1'
    })
    const input = getByDisplayValue('test label')
    await waitFor(() => expect(input).toBeInTheDocument())
  })

  describe('Multichoice', () => {
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
      children: [option]
    }

    const radioQuestion = (
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
    )

    it('should show add option when radio question selected', async () => {
      const { getByText, getByTestId } = render(
        <MockedProvider>
          <EditorProvider
            initialState={{
              steps: [step(block)],
              activeFab: ActiveFab.Add,
              selectedBlock: step(block)
            }}
          >
            <SelectableWrapper block={block}>
              <InlineEditWrapper block={block}>
                {radioQuestion}
              </InlineEditWrapper>
            </SelectableWrapper>
          </EditorProvider>
        </MockedProvider>
      )

      // Select RadioQuestion
      await waitFor(() => fireEvent.click(getByText('option')))
      expect(getByTestId(`SelectableWrapper-${block.id}`)).toHaveStyle({
        outline: '2px solid #C52D3A',
        zIndex: '1'
      })
      expect(getByTestId(`${block.id}-add-option`)).toBeInTheDocument()
    })

    it('should show add option when radio option selected', async () => {
      const { getByText, getByTestId } = render(
        <MockedProvider>
          <EditorProvider
            initialState={{
              steps: [step(block)],
              activeFab: ActiveFab.Save,
              selectedBlock: step(block).children[0]
            }}
          >
            {radioQuestion}
          </EditorProvider>
        </MockedProvider>
      )
      fireEvent.click(getByText('option'))
      expect(getByTestId(`SelectableWrapper-${option.id}`)).toHaveStyle({
        outline: '2px solid #C52D3A',
        zIndex: '1'
      })

      await waitFor(() =>
        expect(getByTestId(`${block.id}-add-option`)).toBeInTheDocument()
      )
    })

    it('should edit radio option label on double click', async () => {
      const { getByDisplayValue, getByText, getByTestId } = render(
        <MockedProvider>
          <EditorProvider
            initialState={{
              steps: [step(block)],
              activeFab: ActiveFab.Save,
              selectedBlock: step(block).children[0]
            }}
          >
            {radioQuestion}
          </EditorProvider>
        </MockedProvider>
      )
      fireEvent.click(getByText('option'))
      fireEvent.click(getByText('option'))
      expect(getByTestId(`SelectableWrapper-${option.id}`)).toHaveStyle({
        outline: '2px solid #C52D3A',
        zIndex: '1'
      })
      const input = getByDisplayValue('option')
      await waitFor(() => expect(input).toBeInTheDocument())
    })
  })
})
