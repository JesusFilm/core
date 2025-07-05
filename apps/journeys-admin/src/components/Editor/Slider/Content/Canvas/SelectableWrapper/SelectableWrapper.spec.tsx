import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { NextRouter, useRouter } from 'next/router'
import { SnackbarProvider } from 'notistack'

import type { TreeBlock } from '@core/journeys/ui/block'
import { Button } from '@core/journeys/ui/Button'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { Image } from '@core/journeys/ui/Image'
import { RadioQuestion } from '@core/journeys/ui/RadioQuestion'
import { SignUp } from '@core/journeys/ui/SignUp'
import { Typography } from '@core/journeys/ui/Typography'

import { ButtonFields } from '../../../../../../../__generated__/ButtonFields'
import { TypographyVariant } from '../../../../../../../__generated__/globalTypes'
import { ImageFields } from '../../../../../../../__generated__/ImageFields'
import { RadioOptionFields } from '../../../../../../../__generated__/RadioOptionFields'
import { RadioQuestionFields } from '../../../../../../../__generated__/RadioQuestionFields'
import { SignUpFields } from '../../../../../../../__generated__/SignUpFields'
import { StepFields } from '../../../../../../../__generated__/StepFields'
import { TypographyFields } from '../../../../../../../__generated__/TypographyFields'

import { SelectableWrapper } from '.'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => true
}))

jest.mock('next/router', () => ({
  __esModule: true,
  useRouter: jest.fn()
}))

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>

describe('SelectableWrapper', () => {
  const push = jest.fn()
  mockUseRouter.mockReturnValue({ push } as unknown as NextRouter)

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
    id: 'button.id',
    parentBlockId: 'parent.id',
    parentOrder: 0,
    label: 'button label',
    buttonVariant: null,
    buttonColor: null,
    size: null,
    startIconId: null,
    endIconId: null,
    submitEnabled: null,
    action: {
      __typename: 'LinkAction',
      parentBlockId: 'button.id',
      gtmEventName: 'gtmEventName',
      url: 'https://www.google.com'
    },
    children: [],
    settings: null
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
    children: [],
    scale: null,
    focalLeft: 50,
    focalTop: 50
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
      slug: null,
      children: blocks
    }
  }

  it('should select blocks on click', async () => {
    const { getByRole, getByTestId, getByText } = render(
      <MockedProvider>
        <SnackbarProvider>
          <EditorProvider
            initialState={{
              steps: [
                step([imageBlock, typographyBlock, buttonBlock, signUpBlock])
              ]
            }}
          >
            <SelectableWrapper block={imageBlock}>
              <Image {...imageBlock} alt="imageAlt" />
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
            <SelectableWrapper block={radioQuestionBlock}>
              <RadioQuestion
                {...radioQuestionBlock}
                wrappers={{ Wrapper: SelectableWrapper }}
              />
            </SelectableWrapper>
          </EditorProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    fireEvent.click(getByRole('img'))
    expect(getByTestId(`SelectableWrapper-${imageBlock.id}`)).toHaveStyle({
      outline: '2px solid',
      zIndex: '1',
      outlineColor: '#C52D3A'
    })
    fireEvent.click(getByText('typography content'))
    expect(getByTestId(`SelectableWrapper-${typographyBlock.id}`)).toHaveStyle({
      outline: '2px solid',
      zIndex: '1',
      outlineColor: '#C52D3A'
    })

    fireEvent.click(getByText('sign up label'))
    await waitFor(() =>
      expect(getByTestId(`SelectableWrapper-${signUpBlock.id}`)).toHaveStyle({
        outline: '2px solid',
        zIndex: '1',
        outlineColor: '#C52D3A'
      })
    )
    fireEvent.click(
      getByTestId(`JourneysRadioQuestion-${radioQuestionBlock.id}`)
    )
    expect(
      getByTestId(`SelectableWrapper-${radioQuestionBlock.id}`)
    ).toHaveStyle({
      outline: '2px solid',
      zIndex: '1',
      outlineColor: '#C52D3A'
    })

    expect(push).not.toHaveBeenCalled()
  })

  it('should select radio question on radio option click', async () => {
    const { getByTestId, getByRole } = render(
      <MockedProvider>
        <SnackbarProvider>
          <EditorProvider
            initialState={{
              steps: [step([radioQuestionBlock])]
            }}
          >
            <SelectableWrapper block={radioQuestionBlock}>
              <RadioQuestion
                {...radioQuestionBlock}
                wrappers={{ Wrapper: SelectableWrapper }}
              />
            </SelectableWrapper>
          </EditorProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    fireEvent.click(getByRole('button', { name: 'Option 1' }))
    expect(
      getByTestId(`SelectableWrapper-${radioQuestionBlock.id}`)
    ).toHaveStyle({
      outline: '2px solid',
      zIndex: '1',
      outlineColor: '#C52D3A'
    })
  })

  it('should select radio option on click when radio question selected', async () => {
    const { getByTestId, getByRole } = render(
      <MockedProvider>
        <SnackbarProvider>
          <EditorProvider
            initialState={{
              selectedBlock: radioQuestionBlock,
              selectedBlockId: radioQuestionBlock.id,
              steps: [step([radioQuestionBlock])]
            }}
          >
            <SelectableWrapper block={radioQuestionBlock}>
              <RadioQuestion
                {...radioQuestionBlock}
                wrappers={{ Wrapper: SelectableWrapper }}
              />
            </SelectableWrapper>
          </EditorProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    await waitFor(() =>
      fireEvent.click(getByRole('button', { name: 'Option 1' }))
    )
    expect(getByTestId(`SelectableWrapper-RadioOption1`)).toHaveStyle({
      outline: '2px solid',
      zIndex: '1',
      outlineColor: '#C52D3A'
    })
    expect(push).not.toHaveBeenCalled()
  })

  it('should select radio option on click when sibling option selected', async () => {
    const { getByTestId, getByRole } = render(
      <MockedProvider>
        <SnackbarProvider>
          <EditorProvider
            initialState={{
              selectedBlock: radioOption1,
              selectedBlockId: radioOption1.id,
              steps: [step([radioQuestionBlock])]
            }}
          >
            <SelectableWrapper block={radioQuestionBlock}>
              <RadioQuestion
                {...radioQuestionBlock}
                wrappers={{ Wrapper: SelectableWrapper }}
              />
            </SelectableWrapper>
          </EditorProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    await waitFor(() => {
      fireEvent.click(getByRole('button', { name: 'Option 1' }))
    })
    expect(getByTestId(`SelectableWrapper-RadioOption1`)).toHaveStyle({
      outline: '2px solid',
      zIndex: '1',
      outlineColor: '#C52D3A'
    })
    expect(push).not.toHaveBeenCalled()
  })
})
