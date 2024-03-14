import { MockedProvider } from '@apollo/client/testing'
import { render } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { journey } from './data'
import { GoalDetails } from './GoalDetails'

describe('GoalDetails', () => {
  it('should return placeholder text', () => {
    const { getByText } = render(
      <MockedProvider>
        <GoalDetails />
      </MockedProvider>
    )
    expect(getByText('What are Goals?')).toBeInTheDocument()
    expect(getByText('Start a Conversation')).toBeInTheDocument()
    expect(getByText('Visit a Website')).toBeInTheDocument()
    expect(getByText('Link to Bible')).toBeInTheDocument()
  })

  it('should return action editor', () => {
    const { getByDisplayValue, getByText } = render(
      <MockedProvider>
        <GoalDetails />
      </MockedProvider>
    )
    expect(getByDisplayValue('https://www.google.com/')).toBeInTheDocument()
    expect(getByText('Visit a website')).toBeInTheDocument()
  })

  it('should return action cards', () => {
    const { getByText } = render(
      <SnackbarProvider>
        <MockedProvider>
          <JourneyProvider value={{ journey, variant: 'admin' }}>
            <GoalDetails />
          </JourneyProvider>
        </MockedProvider>
      </SnackbarProvider>
    )
    expect(getByText('Appears on the cards')).toBeInTheDocument()
  })
})
