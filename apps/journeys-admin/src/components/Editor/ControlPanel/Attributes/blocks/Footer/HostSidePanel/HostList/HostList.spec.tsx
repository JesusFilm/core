import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { JourneyFields as Journey } from '@core/journeys/ui/JourneyProvider/__generated__/JourneyFields'

import { ThemeProvider } from '../../../../../../../ThemeProvider'
import { UPDATE_JOURNEY_HOST } from '../HostForm/HostTitleFieldForm/HostTitleFieldForm'

import { HostList } from './HostList'

jest.mock('uuid', () => ({
  __esModule: true,
  v4: jest.fn()
}))

describe('HostList', () => {
  const defaultHost = {
    id: 'hostId',
    __typename: 'Host' as const,
    teamId: 'teamId',
    title: 'Cru International',
    location: 'Florida, USA',
    src1: 'imageSrc1',
    src2: 'imageSrc2'
  }

  const host2 = {
    id: 'hostId2',
    __typename: 'Host' as const,
    teamId: 'teamId',
    title: 'Another host',
    location: 'Auckland, NZ',
    src1: null,
    src2: null
  }

  const journey = {
    __typename: 'Journey',
    id: 'journeyId',
    seoTitle: 'My awesome journey',
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
    },
    host: defaultHost
  } as unknown as Journey

  it('should render the list of hosts', async () => {
    const { getByRole } = render(
      <MockedProvider>
        <ThemeProvider>
          <JourneyProvider value={{ journey, variant: 'admin' }}>
            <HostList hosts={[defaultHost, host2]} onItemClick={jest.fn()} />
          </JourneyProvider>
        </ThemeProvider>
      </MockedProvider>
    )

    expect(getByRole('list').children).toHaveLength(2)
    expect(
      getByRole('button', {
        name: `${defaultHost.title} ${defaultHost.location}`
      })
    ).toBeInTheDocument()
    expect(
      getByRole('button', {
        name: `${host2.title} ${host2.location}`
      })
    ).toBeInTheDocument()
  })

  it('should update journey host on list item click', async () => {
    const onItemClick = jest.fn()

    const result = jest.fn(() => ({
      data: {
        journeyUpdate: {
          id: journey.id,
          host: {
            id: host2.id
          }
        }
      }
    }))

    const { getByRole } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: UPDATE_JOURNEY_HOST,
              variables: {
                id: journey.id,
                input: {
                  hostId: host2.id
                }
              }
            },
            result
          }
        ]}
      >
        <ThemeProvider>
          <JourneyProvider value={{ journey, variant: 'admin' }}>
            <HostList hosts={[defaultHost, host2]} onItemClick={onItemClick} />
          </JourneyProvider>
        </ThemeProvider>
      </MockedProvider>
    )

    fireEvent.click(
      getByRole('button', {
        name: `${host2.title} ${host2.location}`
      })
    )

    void waitFor(() => expect(result).toHaveBeenCalled())
    void waitFor(() => expect(onItemClick).toHaveBeenCalledWith(host2.id))
  })
})
