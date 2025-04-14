import { MockedProvider } from '@apollo/client/testing'
import { render, screen, waitFor, within } from '@testing-library/react'
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
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { defaultJourney } from '@core/journeys/ui/TemplateView/data'
import { FlagsProvider } from '@core/shared/ui/FlagsProvider'

import { TestEditorState } from '../../../../../../libs/TestEditorState'

import { JourneyAppearance } from './JourneyAppearance'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => true
}))

describe('JourneyAppearance', () => {
  const state: EditorState = {
    steps: [],
    activeSlide: ActiveSlide.JourneyFlow,
    activeContent: ActiveContent.Canvas,
    activeCanvasDetailsDrawer: ActiveCanvasDetailsDrawer.Properties
  }

  beforeEach(() => {
    jest.resetAllMocks()
  })

  it('should display JourneyAppearance attributes for Journey mode', async () => {
    render(
      <MockedProvider>
        <SnackbarProvider>
          <FlagsProvider flags={{ websiteMode: true }}>
            <JourneyProvider value={{ journey: defaultJourney }}>
              <EditorProvider initialState={state}>
                <JourneyAppearance />
              </EditorProvider>
            </JourneyProvider>
          </FlagsProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    expect(screen.getByText('Journey Appearance')).toBeInTheDocument()

    const toggleBtn = screen.getByRole('button', { name: 'Journey' })
    expect(toggleBtn).toBeInTheDocument()
    expect(toggleBtn).toHaveAttribute('aria-pressed', 'true')

    await waitFor(() =>
      expect(screen.getAllByTestId('AccordionSummary')).toHaveLength(4)
    )
  })

  it('should display JourneyAppearance attributes for Website mode', async () => {
    render(
      <MockedProvider>
        <SnackbarProvider>
          <FlagsProvider flags={{ websiteMode: true }}>
            <JourneyProvider
              value={{ journey: { ...defaultJourney, website: true } }}
            >
              <EditorProvider initialState={state}>
                <JourneyAppearance />
              </EditorProvider>
            </JourneyProvider>
          </FlagsProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    expect(screen.getByText('Journey Appearance')).toBeInTheDocument()

    const toggleBtn = screen.getByRole('button', { name: 'Website' })
    expect(toggleBtn).toBeInTheDocument()
    expect(toggleBtn).toHaveAttribute('aria-pressed', 'true')

    await waitFor(() =>
      expect(screen.getAllByTestId('AccordionSummary')).toHaveLength(4)
    )

    expect(
      within(screen.getAllByTestId('AccordionSummary')[0]).getByText('Logo')
    ).toBeInTheDocument()
  })

  it('should return to journey map when close icon is clicked', async () => {
    const contentState = { ...state, activeSlide: ActiveSlide.Content }
    render(
      <MockedProvider>
        <SnackbarProvider>
          <EditorProvider initialState={contentState}>
            <TestEditorState />
            <JourneyAppearance />
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
