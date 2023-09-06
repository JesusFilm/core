import { MockedProvider } from '@apollo/client/testing'
import { render } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { journey } from '../data'

import { ActionCards } from './ActionCards'

describe('ActionCards', () => {
  it('should render action cards', () => {
    const { getByText } = render(
      <SnackbarProvider>
        <MockedProvider>
          <JourneyProvider value={{ journey, variant: 'admin' }}>
            <ActionCards url="https://www.google.com/" />
          </JourneyProvider>
        </MockedProvider>
      </SnackbarProvider>
    )
    expect(getByText('Appears on the cards')).toBeInTheDocument()
    expect(getByText('Button')).toBeInTheDocument()
    expect(getByText('Google link')).toBeInTheDocument()
    expect(getByText('Subscribe')).toBeInTheDocument()
    expect(getByText('Sign Up Form')).toBeInTheDocument()
  })
})
