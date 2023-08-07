import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { defaultJourney } from '../data'

import { TitleDescription } from './TitleDescription'

describe('TitleDescription', () => {
  describe('Journey TitleDescription', () => {
    it('should render the title and description of a journey', () => {
      const { getByText, queryByTestId } = render(
        <MockedProvider>
          <SnackbarProvider>
            <JourneyProvider
              value={{
                journey: defaultJourney,
                variant: 'admin'
              }}
            >
              <TitleDescription />
            </JourneyProvider>
          </SnackbarProvider>
        </MockedProvider>
      )

      expect(getByText('Journey Heading')).toBeInTheDocument()
      expect(getByText('Description')).toBeInTheDocument()
      expect(queryByTestId('CreateRoundedIcon')).not.toBeInTheDocument()
    })
  })

  describe('Template TitleDescription', () => {
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
              <TitleDescription isPublisher />
            </JourneyProvider>
          </SnackbarProvider>
        </MockedProvider>
      )

      expect(getByText('Journey Heading')).toBeInTheDocument()
      expect(getByText('Description')).toBeInTheDocument()
      expect(getByTestId('CreateRoundedIcon')).toBeInTheDocument()
    })

    it('should open TitleDescriptionDialog', () => {
      const { getByRole, getByText } = render(
        <MockedProvider>
          <SnackbarProvider>
            <JourneyProvider
              value={{
                journey: template,
                variant: 'admin'
              }}
            >
              <TitleDescription isPublisher />
            </JourneyProvider>
          </SnackbarProvider>
        </MockedProvider>
      )
      fireEvent.click(getByRole('button'))
      expect(getByText('Edit Title and Description')).toBeInTheDocument()
    })
  })
})
