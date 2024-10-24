import { InMemoryCache } from '@apollo/client'
import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { JourneyFields as Journey } from '@core/journeys/ui/JourneyProvider/__generated__/JourneyFields'

import { CREATE_HOST } from '../../../../../../../../../libs/useHostCreateMutation'
import { useHostUpdateMutation } from '../../../../../../../../../libs/useHostUpdateMutation'
import { UPDATE_HOST } from '../../../../../../../../../libs/useHostUpdateMutation/useHostUpdateMutation'
import { UPDATE_JOURNEY_HOST } from '../../../../../../../../../libs/useUpdateJourneyHostMutation/useUpdateJourneyHostMutation'

import { HostTitleFieldForm } from './HostTitleFieldForm'

jest.mock('uuid', () => ({
  __esModule: true,
  v4: jest.fn()
}))

jest.mock('../../../../../../../../../libs/useHostUpdateMutation', () => ({
  __esModule: true,
  useHostUpdateMutation: jest.fn()
}))

const mockUseHostUpdateMutation = useHostUpdateMutation as jest.MockedFunction<
  typeof useHostUpdateMutation
>

describe('HostTitleFieldForm', () => {
  const updateHost = jest.fn()

  beforeEach(() => {
    mockUseHostUpdateMutation.mockReturnValue({
      updateHost
    })
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  const defaultHost = {
    id: 'hostId',
    __typename: 'Host',
    teamId: 'teamId',
    title: 'Cru International',
    location: null,
    src1: null,
    src2: null
  }

  const journey = {
    __typename: 'Journey',
    id: 'journeyId',
    seoTitle: 'My awesome journey',
    host: defaultHost,
    team: { id: 'teamId' }
  } as unknown as Journey

  it('should create a host on submit if no host exists', async () => {
    const cache = new InMemoryCache()
    cache.restore({})

    const host = {
      id: 'hostId',
      title: 'host title'
    }

    const result = jest.fn(() => ({
      data: {
        hostCreate: host
      }
    }))

    const journeyUpdate = jest.fn(() => ({
      data: {
        journeyUpdate: {
          id: journey.id,
          host: {
            id: host.id
          }
        }
      }
    }))

    const { getByRole } = render(
      <MockedProvider
        cache={cache}
        mocks={[
          {
            request: {
              query: CREATE_HOST,
              variables: {
                teamId: journey?.team?.id,
                input: {
                  title: 'Host title'
                }
              }
            },
            result
          },
          {
            request: {
              query: UPDATE_JOURNEY_HOST,
              variables: {
                id: journey.id,
                input: {
                  hostId: host.id
                }
              }
            },
            result: journeyUpdate
          }
        ]}
      >
        <JourneyProvider
          value={{
            journey: { ...journey, host: null },
            variant: 'admin'
          }}
        >
          <HostTitleFieldForm />
        </JourneyProvider>
      </MockedProvider>
    )

    const field = getByRole('textbox', { name: 'Host Name' })

    fireEvent.change(field, { target: { value: 'Host title' } })
    fireEvent.blur(field)

    await waitFor(() => expect(result).toHaveBeenCalled())
    await waitFor(() => expect(journeyUpdate).toHaveBeenCalled())

    void waitFor(() => {
      expect(cache.extract()['Host:hostId']).toEqual({
        ...defaultHost,
        title: 'Host title'
      })
      expect(cache.extract()[`Journey:${journey.id}`]).toEqual({
        ...journey,
        host: { ...defaultHost, title: 'Host title' }
      })
      expect(cache.extract()?.ROOT_QUERY?.hosts).toEqual([
        { __ref: 'Host:hostId' }
      ])
    })
  })

  it('should update host title on submit if host exists', async () => {
    const cache = new InMemoryCache()
    cache.restore({
      'Host:hostId': defaultHost
    })

    const result = jest.fn(() => ({
      data: {
        hostUpdate: {
          __typename: 'Host',
          id: 'hostId',
          title: 'Host title',
          location: null,
          src1: null,
          src2: null
        }
      }
    }))

    const { getByRole } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: UPDATE_HOST,
              variables: {
                id: 'hostId',
                teamId: 'teamId',
                input: {
                  title: 'Host title'
                }
              }
            },
            result
          }
        ]}
      >
        <JourneyProvider value={{ journey, variant: 'admin' }}>
          <HostTitleFieldForm />
        </JourneyProvider>
      </MockedProvider>
    )

    const field = getByRole('textbox', { name: 'Host Name' })

    expect(field).toHaveValue(journey.host?.title)

    fireEvent.change(field, { target: { value: 'Host title' } })
    fireEvent.blur(field)

    await waitFor(() => expect(result).toHaveBeenCalled())

    void waitFor(() =>
      expect(cache.extract()['Host:hostId']).toEqual({
        ...defaultHost,
        title: 'Host title'
      })
    )
  })

  it('should create host on render if defaulttitle prop provided and host does not exist', async () => {
    const cache = new InMemoryCache()
    cache.restore({})

    const defaultTitle = 'new host name'

    const host = {
      id: 'hostId',
      title: defaultTitle
    }

    const result = jest.fn(() => ({
      data: {
        hostCreate: host
      }
    }))

    const journeyUpdate = jest.fn(() => ({
      data: {
        journeyUpdate: {
          id: journey.id,
          host: {
            id: host.id
          }
        }
      }
    }))

    render(
      <MockedProvider
        cache={cache}
        mocks={[
          {
            request: {
              query: CREATE_HOST,
              variables: {
                teamId: journey?.team?.id,
                input: {
                  title: 'new host name'
                }
              }
            },
            result
          },
          {
            request: {
              query: UPDATE_JOURNEY_HOST,
              variables: {
                id: journey.id,
                input: {
                  hostId: host.id
                }
              }
            },
            result: journeyUpdate
          }
        ]}
      >
        <JourneyProvider
          value={{ journey: { ...journey, host: null }, variant: 'admin' }}
        >
          <HostTitleFieldForm defaultTitle={defaultTitle} />
        </JourneyProvider>
      </MockedProvider>
    )
    await waitFor(() => expect(result).toHaveBeenCalled())
    await waitFor(() => expect(journeyUpdate).toHaveBeenCalled())

    void waitFor(() => {
      expect(cache.extract()['Host:hostId']).toEqual({
        ...defaultHost,
        title: defaultTitle
      })
      expect(cache.extract()[`Journey:${journey.id}`]).toEqual({
        ...journey,
        host: { ...defaultHost, title: defaultTitle }
      })
      expect(cache.extract()?.ROOT_QUERY?.hosts).toEqual([
        { __ref: 'Host:hostId' }
      ])
    })
  })

  it('should not create host on render if defaulttitle prop provided but host already exists', async () => {
    const cache = new InMemoryCache()
    cache.restore({})

    const defaultTitle = 'new host name'

    const host = {
      id: 'hostId',
      title: defaultTitle
    }

    const result = jest.fn(() => ({
      data: {
        hostCreate: host
      }
    }))

    const journeyUpdate = jest.fn(() => ({
      data: {
        journeyUpdate: {
          id: journey.id,
          host: {
            id: host.id
          }
        }
      }
    }))

    render(
      <MockedProvider
        cache={cache}
        mocks={[
          {
            request: {
              query: CREATE_HOST,
              variables: {
                teamId: journey?.team?.id,
                input: {
                  title: 'new host name'
                }
              }
            },
            result
          },
          {
            request: {
              query: UPDATE_JOURNEY_HOST,
              variables: {
                id: journey.id,
                input: {
                  hostId: host.id
                }
              }
            },
            result: journeyUpdate
          }
        ]}
      >
        <JourneyProvider value={{ journey: { ...journey }, variant: 'admin' }}>
          <HostTitleFieldForm defaultTitle={defaultTitle} />
        </JourneyProvider>
      </MockedProvider>
    )
    await waitFor(() => expect(result).not.toHaveBeenCalled())
    await waitFor(() => expect(journeyUpdate).not.toHaveBeenCalled())
  })

  it('should change label if label prop provided', () => {
    render(
      <MockedProvider>
        <JourneyProvider value={{ journey, variant: 'admin' }}>
          <HostTitleFieldForm label="Please enter your name" />
        </JourneyProvider>
      </MockedProvider>
    )

    expect(screen.queryByText('Host Name')).not.toBeInTheDocument() // default label
    expect(screen.getByText('Please enter your name')).toBeInTheDocument()
  })

  it('should show different error message when hosttitlerequirederrormessage prop is passed in', async () => {
    render(
      <MockedProvider>
        <JourneyProvider value={{ journey, variant: 'admin' }}>
          <HostTitleFieldForm hostTitleRequiredErrorMessage="new error message" />
        </JourneyProvider>
      </MockedProvider>
    )

    const field = screen.getByRole('textbox')
    fireEvent.change(field, { target: { value: '' } })
    fireEvent.blur(field)

    await waitFor(() => {
      expect(
        screen.queryByText('Please enter a host name')
      ).not.toBeInTheDocument() // default error message
      expect(screen.getByText('new error message')).toBeInTheDocument()
    })
  })

  it('should use host title instead of defaulttitle in initialvalue if host exists', () => {
    render(
      <MockedProvider>
        <JourneyProvider value={{ journey, variant: 'admin' }}>
          <HostTitleFieldForm defaultTitle="default host name" />
        </JourneyProvider>
      </MockedProvider>
    )

    const hostTitleTextField = screen.getByRole('textbox')

    expect(hostTitleTextField).not.toHaveValue('default host name')
    expect(hostTitleTextField).toHaveValue(defaultHost.title)
  })
})
