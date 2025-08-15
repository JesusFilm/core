import { MockedProvider } from '@apollo/client/testing'
import { render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

import type { TreeBlock } from '@core/journeys/ui/block'
import {
  ActiveCanvasDetailsDrawer,
  EditorProvider
} from '@core/journeys/ui/EditorProvider'

import { BlockFields_StepBlock as StepBlock } from '../../../../../../../__generated__/BlockFields'
import {
  TypographyAlign,
  TypographyColor,
  TypographyVariant
} from '../../../../../../../__generated__/globalTypes'
import { TestEditorState } from '../../../../../../libs/TestEditorState'
import { ThemeProvider } from '../../../../../ThemeProvider'

import { AddBlock } from '.'

describe('AddBlock', () => {
  const selectedStep: TreeBlock<StepBlock> = {
    __typename: 'StepBlock',
    id: 'stepId',
    parentBlockId: 'journeyId',
    parentOrder: 0,
    locked: true,
    nextBlockId: null,
    slug: null,
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
        backdropBlur: null,
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
            children: [],
            settings: {
              __typename: 'TypographyBlockSettings',
              color: null
            }
          }
        ]
      }
    ]
  }

  it('renders add blocks toolbar properly', async () => {
    const { getByTestId } = render(
      <MockedProvider>
        <ThemeProvider>
          <AddBlock />
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
    expect(getByTestId('JourneysAdminButtonNewButton')).toBeInTheDocument()
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
    expect(screen.getByText('activeCanvasDetailsDrawer: 2')).toBeInTheDocument()

    const closeButton = screen.getByTestId('X2Icon')
    expect(closeButton).toBeInTheDocument()
    await waitFor(async () => await userEvent.click(closeButton))

    expect(screen.getByText('activeCanvasDetailsDrawer: 0')).toBeInTheDocument()
  })
})
