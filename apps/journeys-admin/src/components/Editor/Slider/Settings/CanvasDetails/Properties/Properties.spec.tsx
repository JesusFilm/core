import { MockedProvider } from '@apollo/client/testing'
import { render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { SnackbarProvider } from 'notistack'

import { TreeBlock } from '@core/journeys/ui/block'
import {
  ActiveSlide,
  EditorProvider,
  EditorState
} from '@core/journeys/ui/EditorProvider'

import {
  BlockFields_CardBlock as CardBlock,
  BlockFields_StepBlock as StepBlock
} from '../../../../../../../__generated__/BlockFields'
import {
  ThemeMode,
  ThemeName
} from '../../../../../../../__generated__/globalTypes'
import { TestEditorState } from '../../../../../../libs/TestEditorState'

import { Properties } from '.'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => true
}))

describe('Properties', () => {
  it('should return properties for a passed in block', async () => {
    const block = {
      __typename: 'CardBlock',
      id: 'block.id',
      children: []
    } as unknown as TreeBlock
    const state = {
      selectedBlock: null,
      selectedStep: null
    } as unknown as EditorState

    render(
      <MockedProvider>
        <SnackbarProvider>
          <EditorProvider initialState={state}>
            <Properties block={block} />
          </EditorProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    await waitFor(() =>
      expect(screen.getByTestId('CardProperties')).toBeInTheDocument()
    )
  })

  it('should return properties for the selected block in state', async () => {
    const selectedBlock = {
      __typename: 'CardBlock',
      id: 'block.id',
      fullscreen: false,
      backdropBlur: null,
      children: []
    }
    const selectedStep = {}
    const state = {
      selectedBlock,
      selectedStep
    } as unknown as EditorState

    render(
      <MockedProvider>
        <SnackbarProvider>
          <EditorProvider initialState={state}>
            <Properties />
          </EditorProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    await waitFor(() =>
      expect(screen.getByTestId('SettingsDrawer')).toBeInTheDocument()
    )
    expect(screen.getByTestId('CardProperties')).toBeInTheDocument()
  })

  it('should return properties for Card block', async () => {
    const block = {
      __typename: 'CardBlock',
      id: 'block.id',
      children: []
    } as unknown as TreeBlock

    render(
      <MockedProvider>
        <SnackbarProvider>
          <Properties block={block} />
        </SnackbarProvider>
      </MockedProvider>
    )

    await waitFor(() =>
      expect(screen.getByTestId('CardProperties')).toBeInTheDocument()
    )
  })

  it('should return card templates for StepBlock if there are no blocks on the card', async () => {
    const block = {
      __typename: 'StepBlock',
      id: 'block.id',
      children: [
        {
          __typename: 'CardBlock',
          id: 'card.id',
          children: []
        }
      ]
    } as unknown as TreeBlock

    render(
      <MockedProvider>
        <SnackbarProvider>
          <Properties block={block} />
        </SnackbarProvider>
      </MockedProvider>
    )

    await waitFor(() =>
      expect(screen.getByTestId('CardTemplates')).toBeInTheDocument()
    )
  })

  it('should return properties for Video block', async () => {
    const block = {
      __typename: 'VideoBlock',
      id: 'block.id',
      children: []
    } as unknown as TreeBlock

    render(
      <MockedProvider>
        <SnackbarProvider>
          <Properties block={block} />
        </SnackbarProvider>
      </MockedProvider>
    )

    await waitFor(() =>
      expect(screen.getByTestId('VideoProperties')).toBeInTheDocument()
    )
  })

  it('should return properties for Image block', async () => {
    const block = {
      __typename: 'ImageBlock',
      id: 'block.id',
      children: []
    } as unknown as TreeBlock

    render(
      <MockedProvider>
        <SnackbarProvider>
          <Properties block={block} />
        </SnackbarProvider>
      </MockedProvider>
    )

    await waitFor(() =>
      expect(screen.getByTestId('ImageProperties')).toBeInTheDocument()
    )
  })

  it('should return properties for Typography block', async () => {
    const block = {
      __typename: 'TypographyBlock',
      id: 'block.id',
      children: []
    } as unknown as TreeBlock

    render(
      <MockedProvider>
        <SnackbarProvider>
          <Properties block={block} />
        </SnackbarProvider>
      </MockedProvider>
    )

    await waitFor(() =>
      expect(screen.getByTestId('TypographyProperties')).toBeInTheDocument()
    )
  })

  it('should return properties for Button block', async () => {
    const block = {
      __typename: 'ButtonBlock',
      id: 'block.id',
      submitEnabled: false,
      children: []
    } as unknown as TreeBlock

    render(
      <MockedProvider>
        <SnackbarProvider>
          <Properties block={block} />
        </SnackbarProvider>
      </MockedProvider>
    )

    await waitFor(() =>
      expect(screen.getByTestId('ButtonProperties')).toBeInTheDocument()
    )
    expect(screen.getByText('Button Properties')).toBeInTheDocument()
  })

  it('should return properties for Submit Button block', async () => {
    const block = {
      __typename: 'ButtonBlock',
      id: 'block.id',
      submitEnabled: true,
      children: []
    } as unknown as TreeBlock

    render(
      <MockedProvider>
        <SnackbarProvider>
          <Properties block={block} />
        </SnackbarProvider>
      </MockedProvider>
    )

    await waitFor(() =>
      expect(screen.getByTestId('ButtonProperties')).toBeInTheDocument()
    )
    expect(screen.getByText('Submit Button Properties')).toBeInTheDocument()
  })

  it('should return properties for RadioQuestion block', async () => {
    const block = {
      __typename: 'RadioQuestionBlock',
      id: 'block.id',
      children: []
    } as unknown as TreeBlock

    render(
      <MockedProvider>
        <SnackbarProvider>
          <Properties block={block} />
        </SnackbarProvider>
      </MockedProvider>
    )

    await waitFor(() =>
      expect(screen.getByTestId('RadioQuestionProperties')).toBeInTheDocument()
    )
  })

  it('should return properties for Radio Option block', async () => {
    const block = {
      __typename: 'RadioOptionBlock',
      id: 'block.id',
      children: []
    } as unknown as TreeBlock

    render(
      <MockedProvider>
        <SnackbarProvider>
          <Properties block={block} />
        </SnackbarProvider>
      </MockedProvider>
    )

    await waitFor(() =>
      expect(screen.getByTestId('RadioOptionProperties')).toBeInTheDocument()
    )
  })

  it('should return properties for Sign Up block', async () => {
    const block = {
      __typename: 'SignUpBlock',
      id: 'block.id',
      children: []
    } as unknown as TreeBlock

    render(
      <MockedProvider>
        <SnackbarProvider>
          <Properties block={block} />
        </SnackbarProvider>
      </MockedProvider>
    )

    await waitFor(() =>
      expect(screen.getByTestId('SignUpProperties')).toBeInTheDocument()
    )
  })

  it('should return properties for TextResponse block', async () => {
    const block = {
      __typename: 'TextResponseBlock',
      id: 'block.id',
      children: []
    } as unknown as TreeBlock

    render(
      <MockedProvider>
        <SnackbarProvider>
          <Properties block={block} />
        </SnackbarProvider>
      </MockedProvider>
    )

    await waitFor(() =>
      expect(screen.getByTestId('TextResponseProperties')).toBeInTheDocument()
    )
  })

  it('should not return properties if typename does not match', async () => {
    const block = {
      __typename: 'FakeBlock',
      id: 'block.id',
      children: []
    } as unknown as TreeBlock

    const { container } = render(
      <MockedProvider>
        <SnackbarProvider>
          <Properties block={block} />
        </SnackbarProvider>
      </MockedProvider>
    )

    await waitFor(() => expect(container.childElementCount).toBe(0))
  })

  it('should return to journey map when close icon is clicked', async () => {
    const selectedBlock = {
      __typename: 'CardBlock',
      id: 'block.id',
      fullscreen: false,
      backdropBlur: null,
      children: []
    }
    const selectedStep = {}

    const state = {
      selectedBlock,
      selectedStep,
      activeSlide: ActiveSlide.Content
    } as unknown as EditorState

    render(
      <MockedProvider>
        <SnackbarProvider>
          <EditorProvider initialState={state}>
            <TestEditorState />
            <Properties />
          </EditorProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    await waitFor(() =>
      expect(screen.getByTestId('CardProperties')).toBeInTheDocument()
    )
    expect(screen.getByText('activeSlide: 1')).toBeInTheDocument()
    await waitFor(() =>
      expect(screen.getByTestId('X2Icon')).toBeInTheDocument()
    )
    await waitFor(
      async () => await userEvent.click(screen.getByTestId('X2Icon'))
    )

    expect(screen.getByText('activeSlide: 0')).toBeInTheDocument()
  })

  it('should open card properties drawer when card templates is closed, and should not switch to journey map', async () => {
    const card: TreeBlock<CardBlock> = {
      id: 'card1.id',
      __typename: 'CardBlock',
      parentBlockId: 'step1.id',
      coverBlockId: null,
      parentOrder: 0,
      backgroundColor: null,
      themeMode: ThemeMode.light,
      themeName: ThemeName.base,
      fullscreen: false,
      backdropBlur: null,
      children: []
    }

    const step: TreeBlock<StepBlock> = {
      id: 'step.id',
      __typename: 'StepBlock',
      parentBlockId: null,
      parentOrder: 0,
      locked: false,
      nextBlockId: null,
      slug: null,
      children: [card]
    }

    const state = {
      selectedBlock: step,
      selectedStep: step,
      activeSlide: ActiveSlide.Content
    } as unknown as EditorState

    render(
      <MockedProvider>
        <SnackbarProvider>
          <EditorProvider initialState={state}>
            <TestEditorState />
            <Properties />
          </EditorProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    await waitFor(() =>
      expect(screen.getByTestId('CardTemplates')).toBeInTheDocument()
    )
    expect(screen.getByText('activeSlide: 1')).toBeInTheDocument()
    await waitFor(
      async () => await userEvent.click(screen.getByTestId('X2Icon'))
    )

    await waitFor(() =>
      expect(screen.getByTestId('CardProperties')).toBeInTheDocument()
    )
    expect(screen.getByText('activeSlide: 1')).toBeInTheDocument()
  })
})
