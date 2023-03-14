import { MockedProvider } from '@apollo/client/testing'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { render } from '@testing-library/react'
import { ActionDetails } from './ActionDetails'
import { journey } from './data'

describe('ActionDetails', () => {
  const url = 'https://www.google.com/'
  it('should return action editor', () => {
    const { getByDisplayValue } = render(
      <MockedProvider>
        <ActionDetails url={url} />
      </MockedProvider>
    )
    expect(getByDisplayValue('https://www.google.com/')).toBeInTheDocument()
  })

  it('should return action cards', () => {
    const { getByText } = render(
      <MockedProvider>
        <JourneyProvider value={{ journey }}>
          <ActionDetails url={url} />
        </JourneyProvider>
      </MockedProvider>
    )
    expect(
      getByText('It appears on following cards and elements:')
    ).toBeInTheDocument()
  })
})
