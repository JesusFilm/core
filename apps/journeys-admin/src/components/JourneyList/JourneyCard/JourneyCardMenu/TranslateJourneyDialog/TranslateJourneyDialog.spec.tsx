import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen } from '@testing-library/react'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { defaultJourney } from '@core/journeys/ui/TemplateView/data'
import { getLanguagesMock } from '@core/journeys/ui/useLanguagesQuery/useLanguagesQuery.mock'

import { TranslateJourneyDialog } from './TranslateJourneyDialog'

jest.mock('@mui/material/useMediaQuery')

describe('TranslateJourneyDialog', () => {
  it('should render correctly', () => {
    const handleClose = jest.fn()

    render(
      <MockedProvider mocks={[getLanguagesMock]}>
        <JourneyProvider value={{ journey: defaultJourney }}>
          <TranslateJourneyDialog open={true} onClose={handleClose} />
        </JourneyProvider>
      </MockedProvider>
    )

    expect(screen.getByText('Create Translated Copy')).toBeInTheDocument()
    expect(screen.getByText('Select Language')).toBeInTheDocument()
    expect(screen.getByText('Create')).toBeInTheDocument()
    expect(screen.getByText('Cancel')).toBeInTheDocument()
  })

  it('should call onClose when cancel is clicked', () => {
    const handleClose = jest.fn()

    render(
      <MockedProvider mocks={[getLanguagesMock]}>
        <JourneyProvider value={{ journey: defaultJourney }}>
          <TranslateJourneyDialog open={true} onClose={handleClose} />
        </JourneyProvider>
      </MockedProvider>
    )

    fireEvent.click(screen.getByText('Cancel'))
    expect(handleClose).toHaveBeenCalled()
  })

  it('should reset dialog state when closed', () => {
    const handleClose = jest.fn()

    const { rerender } = render(
      <MockedProvider mocks={[getLanguagesMock]}>
        <JourneyProvider value={{ journey: defaultJourney }}>
          <TranslateJourneyDialog open={true} onClose={handleClose} />
        </JourneyProvider>
      </MockedProvider>
    )

    // Simulate dialog being closed
    fireEvent.click(screen.getByText('Cancel'))
    expect(handleClose).toHaveBeenCalled()

    // Rerender with dialog closed, then opened again
    rerender(
      <MockedProvider mocks={[getLanguagesMock]}>
        <JourneyProvider value={{ journey: defaultJourney }}>
          <TranslateJourneyDialog open={false} onClose={handleClose} />
        </JourneyProvider>
      </MockedProvider>
    )

    rerender(
      <MockedProvider mocks={[getLanguagesMock]}>
        <JourneyProvider value={{ journey: defaultJourney }}>
          <TranslateJourneyDialog open={true} onClose={handleClose} />
        </JourneyProvider>
      </MockedProvider>
    )

    // Verify dialog renders correctly after being reset
    expect(screen.getByText('Create Translated Copy')).toBeInTheDocument()
    expect(screen.getByText('Select Language')).toBeInTheDocument()
    expect(screen.getByText('Create')).toBeInTheDocument()
    expect(screen.getByText('Cancel')).toBeInTheDocument()
  })

  // Additional tests will be added as functionality is implemented
})
