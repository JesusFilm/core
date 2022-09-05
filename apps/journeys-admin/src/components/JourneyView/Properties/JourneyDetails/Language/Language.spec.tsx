import { render, fireEvent } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { SnackbarProvider } from 'notistack'
import { GetJourney_journey as Journey } from '../../../../../../__generated__/GetJourney'
import { defaultJourney } from '../../../data'
import { Language } from './Language'

describe('Language', () => {
  it('renders local language', () => {
    const { getByText } = render(
      <MockedProvider>
        <SnackbarProvider>
          <JourneyProvider
            value={{
              journey: {
                createdAt: new Date('2021-11-19T12:34:56.647Z').toISOString(),
                language: {
                  __typename: 'Language',
                  id: '529',
                  name: [
                    {
                      value: 'English',
                      primary: true,
                      __typename: 'Translation'
                    },
                    {
                      value: 'English',
                      primary: false,
                      __typename: 'Translation'
                    }
                  ]
                }
              } as unknown as Journey
            }}
          >
            <Language />
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    expect(getByText('English')).toBeInTheDocument()
  })

  it('renders local language if no native language', () => {
    const { getByText } = render(
      <MockedProvider>
        <SnackbarProvider>
          <JourneyProvider
            value={{
              journey: {
                createdAt: new Date('2021-11-19T12:34:56.647Z').toISOString(),
                language: {
                  __typename: 'Language',
                  id: '529',
                  name: [
                    {
                      value: 'English',
                      primary: false,
                      __typename: 'Translation'
                    }
                  ]
                }
              } as unknown as Journey
            }}
          >
            <Language />
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    expect(getByText('English')).toBeInTheDocument()
  })

  it('renders native language if no local language', () => {
    const { getByText } = render(
      <MockedProvider>
        <SnackbarProvider>
          <JourneyProvider
            value={{
              journey: {
                createdAt: new Date('2021-11-19T12:34:56.647Z').toISOString(),
                language: {
                  __typename: 'Language',
                  id: '529',
                  name: [
                    {
                      value: 'English',
                      primary: true,
                      __typename: 'Translation'
                    }
                  ]
                }
              } as unknown as Journey
            }}
          >
            <Language />
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    expect(getByText('English')).toBeInTheDocument()
  })

  it('renders native language in parens if both exist', () => {
    const { getByText } = render(
      <MockedProvider>
        <SnackbarProvider>
          <JourneyProvider
            value={{
              journey: {
                createdAt: new Date('2021-11-19T12:34:56.647Z').toISOString(),
                language: {
                  __typename: 'Language',
                  id: '529',
                  name: [
                    {
                      value: 'English',
                      primary: true,
                      __typename: 'Translation'
                    },
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
            <Language />
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    expect(getByText('(English)')).toBeInTheDocument()
  })

  it('renders only local language if languages are the same', () => {
    const { queryByText } = render(
      <MockedProvider>
        <SnackbarProvider>
          <JourneyProvider
            value={{
              journey: {
                createdAt: new Date('2021-11-19T12:34:56.647Z').toISOString(),
                language: {
                  __typename: 'Language',
                  id: '529',
                  name: [
                    {
                      value: 'English',
                      primary: true,
                      __typename: 'Translation'
                    },
                    {
                      value: 'English',
                      primary: false,
                      __typename: 'Translation'
                    }
                  ]
                }
              } as unknown as Journey
            }}
          >
            <Language />
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    expect(queryByText('(English)')).toBeNull()
  })

  it('should render language and edit button', () => {
    const { getByText, getByRole } = render(
      <MockedProvider>
        <SnackbarProvider>
          <JourneyProvider
            value={{
              journey: {
                ...defaultJourney,
                language: {
                  __typename: 'Language',
                  id: '529',
                  name: [
                    {
                      value: 'Беларуская мова',
                      primary: true,
                      __typename: 'Translation'
                    },
                    {
                      value: 'Belorussian',
                      primary: false,
                      __typename: 'Translation'
                    }
                  ]
                }
              },
              admin: true
            }}
          >
            <Language isPublisher />
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    expect(getByText('Belorussian')).toBeInTheDocument()
    fireEvent.click(getByRole('button'))
    expect(getByText('Edit Language')).toBeInTheDocument()
  })
})
