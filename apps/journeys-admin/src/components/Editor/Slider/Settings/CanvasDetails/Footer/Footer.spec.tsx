import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import {
  ActiveContent,
  ActiveFab,
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
    activeFab: ActiveFab.Add,
    activeSlide: ActiveSlide.JourneyFlow,
    activeContent: ActiveContent.Canvas,
    activeCanvasDetailsDrawer: ActiveCanvasDetailsDrawer.Properties
  }

  beforeEach(() => {
    jest.resetAllMocks()
  })

  it('should display Footer attributes', () => {
    const { getByText } = render(
      <MockedProvider>
        <SnackbarProvider>
          <EditorProvider initialState={state}>
            <Footer />
          </EditorProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    expect(getByText('Hosted By')).toBeInTheDocument()
    expect(getByText('Chat Widget')).toBeInTheDocument()
  })

  it('should render the components', async () => {
    const { getByTestId } = render(
      <MockedProvider>
        <SnackbarProvider>
          <EditorProvider initialState={state}>
            <Footer />
          </EditorProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    await waitFor(() => expect(getByTestId('Chat')).toBeInTheDocument())
    expect(getByTestId('HostTab')).toBeInTheDocument()
  })

  it('should switch tabs', () => {
    const { getByRole } = render(
      <MockedProvider>
        <SnackbarProvider>
          <EditorProvider initialState={state}>
            <TestEditorState />
            <Footer />
          </EditorProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    expect(getByRole('tab', { name: 'Hosted By' })).toHaveAttribute(
      'aria-selected',
      'true'
    )
    fireEvent.click(getByRole('tab', { name: 'Chat Widget' }))
    expect(getByRole('tab', { name: 'Chat Widget' })).toHaveAttribute(
      'aria-selected',
      'true'
    )
  })
})
