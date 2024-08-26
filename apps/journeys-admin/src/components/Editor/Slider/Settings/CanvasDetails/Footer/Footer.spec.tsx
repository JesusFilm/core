import { MockedProvider } from '@apollo/client/testing'
import { render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { SnackbarProvider } from 'notistack'

import {
  ActiveContent,
  EditorProvider,
  EditorState
} from '@core/journeys/ui/EditorProvider'
import {
  ActiveCanvasDetailsDrawer,
  ActiveSlide
} from '@core/journeys/ui/EditorProvider/EditorProvider'

import { TestEditorState } from '../../../../../../libs/TestEditorState'

import { Footer } from './Footer'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => true
}))

describe('Footer', () => {
  const state: EditorState = {
    steps: [],
    activeSlide: ActiveSlide.JourneyFlow,
    activeContent: ActiveContent.Canvas,
    activeCanvasDetailsDrawer: ActiveCanvasDetailsDrawer.Properties
  }

  beforeEach(() => {
    jest.resetAllMocks()
  })

  it('should display Footer attributes', async () => {
    render(
      <MockedProvider>
        <SnackbarProvider>
          <EditorProvider initialState={state}>
            <Footer />
          </EditorProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    expect(screen.getByText('Journey Appearance')).toBeInTheDocument()

    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: 'Author details' })
      ).toBeInTheDocument()
    )

    const details = await waitFor(() =>
      screen.getByRole('button', { name: 'Author details' })
    )
    const chat = await waitFor(() =>
      screen.getByRole('button', { name: 'Chat widget' })
    )

    expect(details).toBeInTheDocument()
    expect(chat).toBeInTheDocument()
  })

  it('should return to journey map when close icon is clicked', async () => {
    const contentState = { ...state, activeSlide: ActiveSlide.Content }
    render(
      <MockedProvider>
        <SnackbarProvider>
          <EditorProvider initialState={contentState}>
            <TestEditorState />
            <Footer />
          </EditorProvider>
        </SnackbarProvider>
      </MockedProvider>
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
})
