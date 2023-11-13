import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { defaultJourney } from '../data'

import { TemplateSettings } from './TemplateSettings'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => true
}))

describe('TemplateSettings', () => {
  const template = {
    ...defaultJourney,
    template: true
  }

  it('should render the title and description of a template', () => {
    const { getByText, getByTestId } = render(
      <MockedProvider>
        <SnackbarProvider>
          <JourneyProvider
            value={{
              journey: template,
              variant: 'admin'
            }}
          >
            <TemplateSettings isPublisher />
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    expect(getByText('Journey Heading')).toBeInTheDocument()
    expect(getByText('Description')).toBeInTheDocument()
    expect(getByTestId('Edit2Icon')).toBeInTheDocument()
  })

  it('should redirect user to publisher edit', async () => {
    const { getByRole } = render(
      <MockedProvider>
        <SnackbarProvider>
          <JourneyProvider
            value={{
              journey: template,
              variant: 'admin'
            }}
          >
            <TemplateSettings isPublisher />
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    fireEvent.click(getByRole('link'))
    expect(getByRole('link')).toHaveAttribute(
      'href',
      '/publisher/journey-id/edit'
    )
  })
})
