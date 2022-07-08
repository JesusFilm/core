import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { render } from '@testing-library/react'
import { GetJourney_journey as Journey } from '../../../../../__generated__/GetJourney'
import { JourneyDetails } from './JourneyDetails'

describe('journeyDetails', () => {
  it('renders local language', () => {
    const { getByText } = render(
      <JourneyProvider
        value={{
          journey: {
            createdAt: new Date('2021-11-19T12:34:56.647Z').toISOString(),
            language: {
              __typename: 'Language',
              id: '529',
              name: [
                { value: 'English', primary: true, __typename: 'Translation' },
                { value: 'English', primary: false, __typename: 'Translation' }
              ]
            }
          } as unknown as Journey
        }}
      >
        <JourneyDetails />
      </JourneyProvider>
    )
    expect(getByText('English')).toBeInTheDocument()
  })
  it('renders local language if no native language', () => {
    const { getByText } = render(
      <JourneyProvider
        value={{
          journey: {
            createdAt: new Date('2021-11-19T12:34:56.647Z').toISOString(),
            language: {
              __typename: 'Language',
              id: '529',
              name: [
                { value: 'English', primary: false, __typename: 'Translation' }
              ]
            }
          } as unknown as Journey
        }}
      >
        <JourneyDetails />
      </JourneyProvider>
    )
    expect(getByText('English')).toBeInTheDocument()
  })

  it('renders local language if no native language', () => {
    const { getByText } = render(
      <JourneyProvider
        value={{
          journey: {
            createdAt: new Date('2021-11-19T12:34:56.647Z').toISOString(),
            language: {
              __typename: 'Language',
              id: '529',
              name: [
                { value: 'English', primary: false, __typename: 'Translation' }
              ]
            }
          } as unknown as Journey
        }}
      >
        <JourneyDetails />
      </JourneyProvider>
    )
    expect(getByText('English')).toBeInTheDocument()
  })

  it('renders native language if no local language', () => {
    const { getByText } = render(
      <JourneyProvider
        value={{
          journey: {
            createdAt: new Date('2021-11-19T12:34:56.647Z').toISOString(),
            language: {
              __typename: 'Language',
              id: '529',
              name: [
                { value: 'English', primary: true, __typename: 'Translation' }
              ]
            }
          } as unknown as Journey
        }}
      >
        <JourneyDetails />
      </JourneyProvider>
    )
    expect(getByText('English')).toBeInTheDocument()
  })

  it('renders both native language and local language', () => {
    const { getByText } = render(
      <JourneyProvider
        value={{
          journey: {
            createdAt: new Date('2021-11-19T12:34:56.647Z').toISOString(),
            language: {
              __typename: 'Language',
              id: '529',
              name: [
                { value: 'English', primary: true, __typename: 'Translation' },
                {
                  value: 'English 2',
                  primary: false,
                  __typename: 'Translation'
                }
              ]
            }
          } as unknown as Journey
        }}
      >
        <JourneyDetails />
      </JourneyProvider>
    )
    expect(getByText('(English)')).toBeInTheDocument()
  })

  it('renders local language if languages are the same', () => {
    const { queryByText } = render(
      <JourneyProvider
        value={{
          journey: {
            createdAt: new Date('2021-11-19T12:34:56.647Z').toISOString(),
            language: {
              __typename: 'Language',
              id: '529',
              name: [
                { value: 'English', primary: true, __typename: 'Translation' },
                { value: 'English', primary: false, __typename: 'Translation' }
              ]
            }
          } as unknown as Journey
        }}
      >
        <JourneyDetails />
      </JourneyProvider>
    )
    expect(queryByText('(English)')).toBeNull()
  })
})
