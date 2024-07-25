import { MockedProvider } from '@apollo/client/testing'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import {
  ActiveCanvasDetailsDrawer,
  EditorProvider
} from '@core/journeys/ui/EditorProvider'
import type { TreeBlock } from '@core/journeys/ui/block'
import { FlagsProvider } from '@core/shared/ui/FlagsProvider'

import { AddBlock } from '.'
import { BlockFields_StepBlock as StepBlock } from '../../../../../../../__generated__/BlockFields'
import {
  TypographyAlign,
  TypographyColor,
  TypographyVariant
} from '../../../../../../../__generated__/globalTypes'
import { TestEditorState } from '../../../../../../libs/TestEditorState'
import { ThemeProvider } from '../../../../../ThemeProvider'

describe('AddBlock', () => {
  const selectedStep: TreeBlock<StepBlock> = {
    __typename: 'StepBlock',
    id: 'stepId',
    parentBlockId: 'journeyId',
    parentOrder: 0,
    locked: true,
    nextBlockId: null,
    children: [
      {
        id: 'card1.id',
        __typename: 'CardBlock',
        parentBlockId: 'stepId',
        parentOrder: 0,
        coverBlockId: null,
        backgroundColor: null,
        themeMode: null,
        themeName: null,
        fullscreen: false,
        children: [
          {
            id: 'typography0.id',
            __typename: 'TypographyBlock',
            parentBlockId: 'card1.id',
            parentOrder: 0,
            content: 'Title',
            variant: TypographyVariant.h1,
            color: TypographyColor.primary,
            align: TypographyAlign.center,
            children: []
          }
        ]
      }
    ]
  }

  it('renders add blocks toolbar properly', async () => {
    const { getByTestId } = render(
      <MockedProvider>
        <ThemeProvider>
          <FlagsProvider flags={{ formiumForm: true }}>
            <AddBlock />
          </FlagsProvider>
        </ThemeProvider>
      </MockedProvider>
    )

    expect(
      getByTestId('JourneysAdminButtonNewTypographyButton')
    ).toBeInTheDocument()
    expect(getByTestId('JourneysAdminButtonNewImageButton')).toBeInTheDocument()
    expect(getByTestId('JourneysAdminButtonNewVideoButton')).toBeInTheDocument()
    expect(
      getByTestId('JourneysAdminButtonNewRadioQuestionButton')
    ).toBeInTheDocument()
    expect(
      getByTestId('JourneysAdminButtonNewRadioQuestionButton')
    ).toBeInTheDocument()
    expect(
      getByTestId('JourneysAdminButtonNewSignUpButton')
    ).toBeInTheDocument()
    expect(getByTestId('JourneysAdminButtonNewButton')).toBeInTheDocument()
    expect(
      getByTestId('JourneysAdminButtonNewFormiumFormIcon')
    ).toBeInTheDocument()
  })

  it('does not render FormiumForm button when flag is false', () => {
    const { queryByTestId } = render(
      <MockedProvider>
        <ThemeProvider>
          <FlagsProvider flags={{ formiumForm: false }}>
            <AddBlock />
          </FlagsProvider>
        </ThemeProvider>
      </MockedProvider>
    )
    expect(
      queryByTestId('JourneysAdminButtonNewFormiumFormIcon')
    ).not.toBeInTheDocument()
  })

  it('should disable NewVideoButton when there are other blocks on the Card', () => {
    const { getByTestId } = render(
      <MockedProvider>
        <ThemeProvider>
          <EditorProvider initialState={{ selectedStep }}>
            <AddBlock />
          </EditorProvider>
        </ThemeProvider>
      </MockedProvider>
    )

    const newVideoButtonDiv = getByTestId('JourneysAdminButtonNewVideoButton')
    const newVideoButton = newVideoButtonDiv.querySelector('button')

    expect(newVideoButton).toBeDisabled()
  })

  it('should return to card properties when close button is clicked', async () => {
    render(
      <MockedProvider>
        <ThemeProvider>
          <EditorProvider
            initialState={{
              selectedStep,
              activeCanvasDetailsDrawer: ActiveCanvasDetailsDrawer.AddBlock
            }}
          >
            <TestEditorState />
            <AddBlock />
          </EditorProvider>
        </ThemeProvider>
      </MockedProvider>
    )

    await waitFor(() =>
      expect(screen.getByTestId('X2Icon')).toBeInTheDocument()
    )
    await waitFor(
      async () => await userEvent.click(screen.getByTestId('X2Icon'))
    )

    expect(screen.getByText('activeCanvasDetailsDrawer: 0')).toBeInTheDocument()
  })
})
