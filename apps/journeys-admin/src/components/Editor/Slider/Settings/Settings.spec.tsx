import { MockedProvider } from '@apollo/client/testing'
import { render, screen } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import {
  ActiveCanvasDetailsDrawer,
  ActiveContent,
  EditorProvider
} from '@core/journeys/ui/EditorProvider'

import { Settings } from './Settings'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: jest.fn(() => false)
}))

describe('Settings', () => {
  it('renders with CanvasDetails by default', () => {
    render(
      <MockedProvider>
        <SnackbarProvider>
          <EditorProvider>
            <Settings />
          </EditorProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    expect(screen.getByTestId('Settings')).toBeInTheDocument()
  })

  it('renders with GoalDetails when activeContent is Goals', () => {
    render(
      <MockedProvider>
        <EditorProvider initialState={{ activeContent: ActiveContent.Goals }}>
          <Settings />
        </EditorProvider>
      </MockedProvider>
    )

    expect(screen.getByTestId('Settings')).toBeInTheDocument()
    expect(screen.getByText('Information')).toBeInTheDocument()
  })

  it('renders with SocialDetails when activeContent is Social', () => {
    render(
      <MockedProvider>
        <EditorProvider initialState={{ activeContent: ActiveContent.Social }}>
          <Settings />
        </EditorProvider>
      </MockedProvider>
    )

    expect(screen.getByTestId('Settings')).toBeInTheDocument()
    expect(screen.getByText('Social Share Preview')).toBeInTheDocument()
  })

  it('should display social details', () => {
    render(
      <MockedProvider>
        <EditorProvider initialState={{ activeContent: ActiveContent.Social }}>
          <Settings />
        </EditorProvider>
      </MockedProvider>
    )

    expect(screen.getByTestId('SettingsDrawer')).toBeInTheDocument()
    expect(screen.getByText('Social Share Preview')).toBeInTheDocument()
  })

  it('should display goal details', () => {
    render(
      <MockedProvider>
        <EditorProvider initialState={{ activeContent: ActiveContent.Goals }}>
          <Settings />
        </EditorProvider>
      </MockedProvider>
    )

    expect(screen.getByTestId('SettingsDrawer')).toBeInTheDocument()
    expect(screen.getByText('Information')).toBeInTheDocument()
  })

  it('should display canvas details', () => {
    render(
      <MockedProvider>
        <SnackbarProvider>
          <EditorProvider
            initialState={{
              activeContent: ActiveContent.Canvas,
              activeCanvasDetailsDrawer:
                ActiveCanvasDetailsDrawer.JourneyAppearance
            }}
          >
            <Settings />
          </EditorProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    expect(screen.getByTestId('SettingsDrawer')).toBeInTheDocument()
    expect(screen.getByText('Journey Appearance')).toBeInTheDocument()
  })
})
