import { render, fireEvent } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { SnackbarProvider } from 'notistack'
import { defaultJourney } from '../../../data'
import { TemplateLanguage } from './TemplateLanguage'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => true
}))

describe('TemplateLanguage', () => {
  it('should render template language', () => {
    const { getByText, queryByRole } = render(
      <MockedProvider>
        <SnackbarProvider>
          <JourneyProvider value={{ journey: defaultJourney, admin: true }}>
            <TemplateLanguage />
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    expect(getByText('English')).toBeInTheDocument()
    expect(queryByRole('button')).not.toBeInTheDocument()
  })

  it('should render template language and edit button', () => {
    const { getByText, getByRole } = render(
      <MockedProvider>
        <SnackbarProvider>
          <JourneyProvider value={{ journey: defaultJourney, admin: true }}>
            <TemplateLanguage isPublisher />
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    expect(getByText('English')).toBeInTheDocument()
    fireEvent.click(getByRole('button'))
    expect(getByText('Edit Language')).toBeInTheDocument()
  })
})
