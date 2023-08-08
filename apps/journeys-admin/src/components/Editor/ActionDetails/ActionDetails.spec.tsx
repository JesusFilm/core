import { MockedProvider } from '@apollo/client/testing'
import { render } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { ActionDetails } from './ActionDetails'
import { journey } from './data'

describe('ActionDetails', () => {
  const url = 'https://www.google.com/'

  it('should return placeholder text', () => {
    const { getByText } = render(
      <MockedProvider>
        <ActionDetails goalLabel={() => 'Visit a website'} />
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
        <ActionDetails url={url} goalLabel={() => 'Visit a website'} />
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
            <ActionDetails url={url} goalLabel={() => 'Visit a website'} />
          </JourneyProvider>
        </MockedProvider>
      </SnackbarProvider>
    )
    expect(getByText('Appears on the cards')).toBeInTheDocument()
  })
})
