import { render, fireEvent } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import {
  EditorProvider,
  TreeBlock,
  ActiveFab,
  Button,
  Image,
  RadioQuestion,
  SignUp,
  Typography
} from '@core/journeys/ui'
import { ButtonFields } from '../../../../../__generated__/ButtonFields'
import { SignUpFields } from '../../../../../__generated__/SignUpFields'
import { ImageFields } from '../../../../../__generated__/ImageFields'
import { RadioOptionFields } from '../../../../../__generated__/RadioOptionFields'
import { RadioQuestionFields } from '../../../../../__generated__/RadioQuestionFields'
import { StepFields } from '../../../../../__generated__/StepFields'
import { TypographyVariant } from '../../../../../__generated__/globalTypes'
import { TypographyFields } from '../../../../../__generated__/TypographyFields'
import { SelectableWrapper } from '.'

describe('SelectableWrapper', () => {
  const typographyBlock: TreeBlock<TypographyFields> = {
    __typename: 'TypographyBlock',
    id: 'typography.id',
    parentBlockId: 'parent.id',
    parentOrder: 0,
    variant: TypographyVariant.body1,
    content: 'typography content',
    color: null,
    align: null,
    children: []
  }

  const buttonBlock: TreeBlock<ButtonFields> = {
    __typename: 'ButtonBlock',
    id: 'button',
    parentBlockId: 'parent.id',
    parentOrder: 0,
    label: 'button label',
    buttonVariant: null,
    buttonColor: null,
    size: null,
    startIconId: null,
    endIconId: null,
    action: null,
    children: []
  }

  const imageBlock: TreeBlock<ImageFields> = {
    __typename: 'ImageBlock',
    id: 'image.id',
    src: 'https://images.unsplash.com/photo-1600133153574-25d98a99528c?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1600&q=80',
    width: 1600,
    height: 1067,
    alt: 'random image from unsplash',
    parentBlockId: 'parent.id',
    parentOrder: 0,
    blurhash: 'L9AS}j^-0dVC4Tq[=~PATeXSV?aL',
    children: []
  }

  const radioOption1: TreeBlock<RadioOptionFields> = {
    __typename: 'RadioOptionBlock',
    id: 'RadioOption1',
    label: 'Option 1',
    parentBlockId: 'RadioQuestion1',
    parentOrder: 0,
    action: null,
    children: []
  }

  const radioQuestionBlock: TreeBlock<RadioQuestionFields> = {
    __typename: 'RadioQuestionBlock',
    id: 'RadioQuestion1',
    label: 'Label',
    description: 'Description',
    parentBlockId: 'parent.id',
    parentOrder: 0,
    children: [
      radioOption1,
      {
        __typename: 'RadioOptionBlock',
        id: 'RadioOption2',
        label: 'Option 2',
        parentBlockId: 'RadioQuestion1',
        parentOrder: 1,
        action: null,
        children: []
      }
    ]
  }

  const signUpBlock: TreeBlock<SignUpFields> = {
    id: 'signup.id',
    __typename: 'SignUpBlock',
    parentBlockId: 'parent.id',
    parentOrder: 0,
    submitLabel: 'sign up label',
    action: null,
    submitIconId: null,
    children: []
  }

  const step = (blocks: TreeBlock[]): TreeBlock<StepFields> => {
    return {
      __typename: 'StepBlock',
      id: 'parent.id',
      parentBlockId: null,
      parentOrder: 0,
      locked: true,
      nextBlockId: null,
      children: blocks
    }
  }

  it('should select blocks on click', async () => {
    const { getByRole, getByTestId, getByText } = render(
      <MockedProvider>
        <EditorProvider
          initialState={{
            steps: [
              step([imageBlock, typographyBlock, buttonBlock, signUpBlock])
            ],
            activeFab: ActiveFab.Add
          }}
        >
          <SelectableWrapper block={imageBlock}>
            <Image {...imageBlock} alt={'imageAlt'} />
          </SelectableWrapper>
          {/* Video */}
          <SelectableWrapper block={typographyBlock}>
            <Typography {...typographyBlock} />
          </SelectableWrapper>
          <SelectableWrapper block={buttonBlock}>
            <Button {...buttonBlock} />
          </SelectableWrapper>
          <SelectableWrapper block={signUpBlock}>
            <SignUp {...signUpBlock} />
          </SelectableWrapper>
        </EditorProvider>
      </MockedProvider>
    )

    fireEvent.click(getByRole('img'))
    expect(getByTestId(`selected-${imageBlock.id}`)).toHaveStyle({
      outline: '3px solid #C52D3A',
      zIndex: '1'
    })
    fireEvent.click(getByText('typography content'))
    expect(getByTestId(`selected-${typographyBlock.id}`)).toHaveStyle({
      outline: '3px solid #C52D3A',
      zIndex: '1'
    })

    fireEvent.click(getByText('button label'))
    expect(getByTestId(`selected-${buttonBlock.id}`)).toHaveStyle({
      outline: '3px solid #C52D3A',
      zIndex: '1'
    })
    fireEvent.click(getByText('sign up label'))
    expect(getByTestId(`selected-${signUpBlock.id}`)).toHaveStyle({
      outline: '3px solid #C52D3A',
      zIndex: '1'
    })
  })

  it('should select radio question on radio option click', async () => {
    const { getByTestId, getByRole } = render(
      <MockedProvider>
        <EditorProvider
          initialState={{
            steps: [step([radioQuestionBlock])],
            activeFab: ActiveFab.Add
          }}
        >
          <SelectableWrapper block={radioQuestionBlock}>
            <RadioQuestion
              {...radioQuestionBlock}
              wrappers={{ Wrapper: SelectableWrapper }}
            />
          </SelectableWrapper>
        </EditorProvider>
      </MockedProvider>
    )

    fireEvent.click(getByRole('button', { name: 'Option 1' }))
    expect(getByTestId(`selected-${radioQuestionBlock.id}`)).toHaveStyle({
      outline: '3px solid #C52D3A',
      zIndex: '1'
    })
  })

  it('should select radio option on click when radio question selected', async () => {
    const { getByTestId, getByRole } = render(
      <MockedProvider>
        <EditorProvider
          initialState={{
            selectedBlock: radioQuestionBlock,
            steps: [step([radioQuestionBlock])],
            activeFab: ActiveFab.Add
          }}
        >
          <SelectableWrapper block={radioQuestionBlock}>
            <RadioQuestion
              {...radioQuestionBlock}
              wrappers={{ Wrapper: SelectableWrapper }}
            />
          </SelectableWrapper>
        </EditorProvider>
      </MockedProvider>
    )

    fireEvent.click(getByRole('button', { name: 'Option 1' }))
    expect(getByTestId(`selected-RadioOption1`)).toHaveStyle({
      outline: '3px solid #C52D3A',
      zIndex: '1'
    })
  })

  it('should select radio option on click when sibling option selected', async () => {
    const { getByTestId, getByRole } = render(
      <MockedProvider>
        <EditorProvider
          initialState={{
            selectedBlock: radioOption1,
            steps: [step([radioQuestionBlock])],
            activeFab: ActiveFab.Add
          }}
        >
          <SelectableWrapper block={radioQuestionBlock}>
            <RadioQuestion
              {...radioQuestionBlock}
              wrappers={{ Wrapper: SelectableWrapper }}
            />
          </SelectableWrapper>
        </EditorProvider>
      </MockedProvider>
    )

    fireEvent.click(getByRole('button', { name: 'Option 1' }))
    expect(getByTestId(`selected-RadioOption1`)).toHaveStyle({
      outline: '3px solid #C52D3A',
      zIndex: '1'
    })
  })
})
